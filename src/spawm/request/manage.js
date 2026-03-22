import { sendRequest } from "./sandbox";
import { set, get } from "../cache";
import { subscribe, unsubscribe } from './revalidate';

/**
 *
 * @var {m} method
 * @var {d} data
 * @var {q} queryString
 * @var {h} headers
 * @var {u} url
 * @var {rd} redirect
 * @var {r} response
 * @var {t} type
 * @var {c} cache
 * @var {n} now
 * @var {w} worker
 */
const fn = {};
const inFlight = new Map();

function solve(xhr, resolve, reject) {
  if (xhr.rd) return (location.href = xhr.u);
  const payload = { status: xhr.s, headers: xhr.h, swr: xhr.swr };
  if (xhr.s < 1 || xhr.s > 399) {
    const error = new Error(xhr.s ? "Client" : "Network");
    error.data = xhr.r;
    reject(Object.assign(error, payload));
  } else {
    resolve(xhr.r, payload);
  }
}

function abortRequest(worker, id) {
  const abortObject = { a: true, id };
  inFlight.delete(id);
  if (worker) {
    worker.postMessage(abortObject);
    worker.removeEventListener('message', fn[id]);
    return delete fn[id];
  }
  sendRequest(abortObject);
}

function setCache(request, response, resolve, reject, swr) {
  if (!['blob', 'arraybuffer', 'document'].includes(request.t)) {
    if (request.c && response.s > 0 && response.s < 400) {
      const id = request.i ? response.id.substring(1) : response.id;
      response.n = new Date();
      set(id, response);
    }
    if (request.r) {
      request.r.v = JSON.stringify(response.r);
    }
  }
  if (resolve) {
    solve(response, resolve, reject);
  } else if (swr && swr.onUpdate && !response.swr) {
    swr.onUpdate(response.r, { status: response.s, headers: response.h });
  }
}

function hash(str) {
  let h1 = 0x811c9dc5
  let h2 = 5381;
  for (let i = 0; i < str.length; i++) {
    const c = str.charCodeAt(i);
    h1 = ((h1 ^ c) * 0x01000193) >>> 0;
    h2 = ((h2 * 33) ^ c) >>> 0;
  }
  return h1.toString(36) + h2.toString(36);
}

export function execute(worker, request, resolve, reject, swr) {
  const { id } = request;
  if (inFlight.has(id)) {
    return inFlight.get(id).push({ resolve, reject });
  }
  inFlight.set(id, [{ resolve, reject }]);
  const callback = (res) => {
    const observers = inFlight.get(id) || [];
    inFlight.delete(id);
    observers.forEach(
      observer => setCache(request, res, observer.resolve, observer.reject, swr)
    );
    if (request.i) inFlight.set(id, []);
  };
  if (worker) {
    worker.postMessage(request);
    fn[id] = ({ data }) => {
      if (data.id === id) {
        callback(data);
        if (!request.i) {
          worker.removeEventListener('message', fn[id]);
          delete fn[id];
        }
      }
    };
    return worker.addEventListener('message', fn[id]);
  }
  sendRequest(request, callback);
}

export default function manage(resource, method, data, query) {
  const { w: worker, swr, u, h, ...props } = resource;
  const request = { u, h, m: method, d: data, q: query };
  const id = hash(JSON.stringify(request, (_, v) => {
    if (v instanceof URLSearchParams) return v.toString();
    if (v instanceof FormData) return Array.from(v.entries());
    if (v instanceof ArrayBuffer) return { $t: 'ab', $s: v.byteLength };
    if (v instanceof Blob) return { $t: 'blob', $s: v.size, $m: v.type };
    return v;
  }));
  const isGet = method === 'GET';
  let resolver;
  Object.assign(request, props);
  request.id = id;
  if (swr && isGet) {
    request.r = { v: '{}' };
    subscribe(id, { w: worker, r: request, swr });
  }
  const promise = new Promise((resolve, reject) => {
    const cached = get(id);
    if (cached && isGet) {
      const isValid = new Date(new Date(cached.n).getTime() + 1000 * request.c) > new Date();
      if (request.c === Infinity || isValid) {
        return solve(cached, resolve, reject);
      }
      if (swr) {
        solve(cached, resolve, reject);
        return execute(worker, request, null, null, swr);
      }
    }
    execute(worker, request, resolve, reject, swr);
    resolver = resolve;
  });
  promise.abort = () => {
    const observers = inFlight.get(id);
    if (resolver && observers) {
        const index = observers.findIndex(o => o.resolve === resolver);
        if (index !== -1) {
          const [observer] = observers.splice(index, 1);
          observer.reject(new Error("Aborted"));
        }
        if (observers.length > 0) return;
    }
    abortRequest(worker, id);
    abortRequest(worker, 'i' + id);
    unsubscribe(id);
  }
  return promise;
}
