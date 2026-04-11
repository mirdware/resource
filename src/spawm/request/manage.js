import { sendRequest } from './sandbox';
import { set, get } from '../cache';
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
 * @var {ou} onUploading
 * @var {od} onDownloading
 */
const fn = {};
const inFlight = new Map();

function parse(response) {
  if (response.t === 'document') {
    const parser = new DOMParser();
    const mime = response.h['content-type']?.split(';')[0].trim() || 'text/html';
    return parser.parseFromString(response.r, mime);
  }
  return response.r;
}

function solve(response, resolve, reject) {
  if (response.rd) return (location.href = response.u);
  const payload = { data: parse(response), status: response.s, headers: response.h, swr: response.swr };
  const { s: status } = response;
  if (status < 1 || status > 399) {
    const error = new Error(status ? 'Client Error ' + status : 'Network');
    reject(Object.assign(error, payload));
  } else {
    resolve(payload.data);
  }
}

function setCache(request, response, resolve, reject, swr) {
  if (!['blob', 'arraybuffer'].includes(request.t)) {
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

export function execute(request, payload, promiseObserver) {
  const { w: worker, od: onDownloading, ou: onUploading } = payload;
  const { id } = request;
  promiseObserver = promiseObserver || {};
  if (inFlight.has(id)) {
    return inFlight.get(id).push(promiseObserver);
  }
  inFlight.set(id, [promiseObserver]);
  const callback = (response) => {
    if (response.p) {
      response.up ?
      onUploading && onUploading(response.l, response.p) :
      onDownloading && onDownloading(response.l, response.p);
    } else {
      const observers = inFlight.get(id) || [];
      inFlight.delete(id);
      observers.forEach(
        observer => setCache(request, response, observer.resolve, observer.reject, payload.swr)
      );
      if (request.i) inFlight.set(id, [{}]);
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

export default function manage(options, method, data, query) {
  const { w: worker, p_: promises, od, ou, swr, u, h, ...props } = options;
  const request = { u, h, m: method, d: data, q: query };
  const id = hash(JSON.stringify(request, (_, v) => {
    if (v instanceof URLSearchParams) return v.toString();
    if (v instanceof ArrayBuffer) return { $t: 'ab', $s: v.byteLength };
    if (v instanceof Blob) return { $t: 'blob', $s: v.size, $m: v.type };
    return v;
  }));
  const cached = method === 'GET' ? get(id) : null;
  const payload = { w: worker, r: request, swr, od, ou };
  let resolver;
  Object.assign(request, props);
  request.id = id;
  if (swr && cached !== null) {
    request.r = { v: cached?.rv || '{}' };
    subscribe(id, payload);
  }
  const promise = new Promise((resolve, reject) => {
    if (cached) {
      const isValid = new Date(new Date(cached.n).getTime() + 1000 * request.c) > new Date();
      if (request.c === Infinity || isValid) {
        return solve(cached, resolve, reject);
      }
      if (swr) {
        solve(cached, resolve, reject);
        return execute(request, payload);
      }
    }
    execute(request, payload, { resolve, reject });
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
    promises.delete(promise);
  }
  request.r && promises.add(promise);
  return promise;
}
