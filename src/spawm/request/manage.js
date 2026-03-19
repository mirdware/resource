import { sendRequest } from "./sandbox";
import { set, get } from "../cache";
import { subscribe, unsubscribe } from './validate';

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

function solve(xhr, resolve, reject) {
  if (xhr.rd) return location = xhr.u;
  const action = xhr.s > 399 ? reject : resolve;
  action(xhr.r, { status: xhr.s, swr: xhr.swr });
}

function setCache(request, response, resolve, reject, swr) {
  if (!isNaN(request.c)) {
    const id = request.i ? response.id.substring(1) : response.id;
    response.n = new Date();
    set(id, response);
  }
  if (request.r) {
    request.r.v = JSON.stringify(response.r);
  }
  if (resolve) {
    solve(response, resolve, reject);
  } else if (swr && swr.onUpdate && !response.swr) {
    swr.onUpdate(response.r, { status: response.s });
  }
}

function hash(str) {
  let h = 5381, i = str.length;
  while (i) h = (h * 33) ^ str.charCodeAt(--i);
  return (h >>> 0).toString(36);
}

export function execute(worker, request, resolve, reject, swr) {
  const { id } = request;
  const callback = (res) => setCache(request, res, resolve, reject, swr);
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
  const { w: worker, swr, ...props } = resource;
  const request = {
    m: method,
    d: data,
    q: query,
    u: resource.u
  };
  const id = hash(JSON.stringify(request));
  const isGet = request.m === 'GET';
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
  });
  promise.abort = () => {
    const iid = 'i' + id;
    unsubscribe(id);
    if (worker) {
      worker.postMessage({ a: true, id });
      worker.postMessage({ a: true, id: iid });
    }
    delete fn[id];
    delete fn[iid];
  }
  return promise;
}
