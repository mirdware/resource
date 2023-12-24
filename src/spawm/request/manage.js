import { sendRequest } from "./sandbox";

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
const cache = {};

function solve(xhr, resolve, reject) {
  if (xhr.rd) return location = xhr.u;
  const action = xhr.s > 399 ? reject : resolve;
  action(xhr.r, {
    status: xhr.s,
    swr: xhr.swr
  });
}

function setCache(request, response, resolve, reject) {
  if (!isNaN(request.c)) {
    response.n = new Date();
    cache[response.id] = JSON.stringify(response);
  }
  if (request.r) {
    request.r = JSON.stringify(response.r);
  }
  solve(response, resolve, reject);
}

export function execute(worker, request, resolve, reject) {
  const { id } = request;
  if (worker) {
    worker.postMessage(request);
    fn[id] = ({ data }) => {
      if (data.id === id) {
        setCache(request, data, resolve, reject);
        if (!request.i) {
          worker.removeEventListener('message', fn[id]);
          delete fn[id];
        }
      }
    };
    return worker.addEventListener('message', fn[id]);
  }
  sendRequest(request, (res) => {
    setCache(request, res, resolve, reject);
  });
}

export default function manage(resource, method, data, queryString) {
  const { w: worker, swr, ...props } = resource;
  const request = {
    m: method,
    d: data,
    q: queryString,
    u: resource.u
  };
  const id = JSON.stringify(request);
  Object.assign(request, props);
  request.id = id;
  if (swr) {
    swr[id] = request;
    request.r = '{}';
  }
  return new Promise((resolve, reject) => {
    const res = cache[id] ? JSON.parse(cache[id]) : null;
    if (
      res && request.m === 'GET' &&
      (
        request.c === Infinity ||
        new Date(new Date(res.n).getTime() + 1000 * request.c) > new Date()
      )
    ) {
      return solve(res, resolve, reject);
    }
    execute(worker, request, resolve, reject);
  });
}
