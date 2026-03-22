import { sendRequest } from "./sandbox";
import { set, get } from "../cache";
import { subscribe, unsubscribe } from './revalidate';

/**
 *
 * @var {m} method
 * @var {h} headers
 * @var {d} data
 * @var {q} query
 * @var {h} headers
 * @var {u} url
 * @var {rd} redirect
 * @var {r} response
 * @var {t} type
 * @var {c} cache
 * @var {n} now
 * @var {w} worker
 * @var {i} interval
 * @var {l} length
 * @var {t} type
 * @var {p} progress
 */
const fn = {};
const inFlight = new Map();

function parse(xhr) {
  if (xhr.t === "document") {
    const parser = new DOMParser();
    const mime = xhr.h['content-type']?.split(';')[0].trim() || 'text/html';
    return parser.parseFromString(xhr.r, mime);
  }
  return xhr.r;
}

function solve(xhr, resolve, reject) {
  if (xhr.rd) return (location.href = xhr.u);
  const payload = { data: parse(xhr), status: xhr.s, headers: xhr.h, swr: xhr.swr };
  if (xhr.s < 1 || xhr.s > 399) {
    const error = new Error(xhr.s ? "Client" : "Network");
    reject(Object.assign(error, payload));
  } else {
    resolve(payload.data);
  }
}

function setCache(request, response, resolve, reject, swr) {
  if (!["blob", "arraybuffer"].includes(request.t)) {
    if (request.c && response.s > 0 && response.s < 400) {
      const id = request.i ? response.id.substring(1) : response.id;
      response.n = new Date();
      set(id, response);
    }
    if (request.r) {
      request.r.v = response.rv;
    }
  }
  if (resolve) {
    solve(response, resolve, reject);
  } else if (swr && swr.onUpdate && !response.swr) {
    swr.onUpdate(parse(response), { status: response.s, headers: response.h });
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

export function execute(worker, request, resolve, reject, swr, onProgress) {
  const { id } = request;
  if (inFlight.has(id)) {
    return inFlight.get(id).push({ resolve, reject });
  }
  inFlight.set(id, [{ resolve, reject }]);
  const callback = (res) => {
    if (res.p) {
      if (onProgress) {
        onProgress(res.l, res.p);
      }
    } else {
      const observers = inFlight.get(id) || [];
      inFlight.delete(id);
      observers.forEach(
        observer => setCache(request, res, observer.resolve, observer.reject, swr)
      );
      if (request.i) inFlight.set(id, []);
    }
  };
  if (worker) {
    worker.postMessage(request);
    fn[id] = ({ data }) => {
      if (data.id === id) {
        callback(data);
        if (!data.p && !request.i) {
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
  const { w: worker, swr, u, h, op: onProgress, ...props } = resource;
  const request = { u, h, m: method, d: data, q: query };
  const id = hash(JSON.stringify(request, (_, v) => {
    if (v instanceof URLSearchParams) return v.toString();
    if (v instanceof ArrayBuffer) return { $t: "ab", $s: v.byteLength };
    if (v instanceof Blob) return { $t: "blob", $s: v.size, $m: v.type };
    return v;
  }));
  const cached = method === 'GET' ? get(id) : null;
  let resolver;
  Object.assign(request, props);
  request.id = id;
  if (swr && cached !== null) {
    request.r = { v: cached?.rv ?? '{}' };
    subscribe(id, { w: worker, r: request, swr });
  }
  const promise = new Promise((resolve, reject) => {
    if (cached) {
      const isValid = new Date(new Date(cached.n).getTime() + 1000 * request.c) > new Date();
      if (request.c === Infinity || isValid) {
        return solve(cached, resolve, reject);
      }
      if (swr) {
        solve(cached, resolve, reject);
        return execute(worker, request, null, null, swr, onProgress);
      }
    }
    execute(worker, request, resolve, reject, swr, onProgress);
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
