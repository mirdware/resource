import { sendRequest } from "./sandbox";
import { set, get } from "../cache";

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
  (xhr.s > 399) ? reject(xhr.r, xhr.s) : resolve(xhr.r, xhr.s);
}

function execute(key, request, response, resolve, reject) {
  if (!isNaN(request.c)) {
    response.n = new Date();
    set(key, response);
  }
  solve(response, resolve, reject);
}

function uuid() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  );
}

export default function manage(resource, method, data, queryString) {
  const worker = resource.w;
  const id = uuid();
  const request = Object.assign({
    id,
    m: method,
    d: data,
    q: queryString
  }, resource);
  delete request.w;
  return new Promise((resolve, reject) => {
    const key = JSON.stringify({
      m: request.m,
      d: request.d,
      q: request.q,
      u: request.u
    });
    const res = get(key);
    if (
      request.m === 'GET' && res &&
      (
        request.c === Infinity ||
        new Date(new Date(res.n).getTime() + 1000 * request.c) > new Date()
      )
    ) {
      return solve(res, resolve, reject);
    }
    if (worker) {
      worker.postMessage(request);
      fn[id] = ({ data }) => {
        if (data.id === id) {
          execute(key, request, data, resolve, reject);
          worker.removeEventListener('message', fn[id]);
          delete fn[id];
        }
      };
      return worker.addEventListener('message', fn[id]);
    }
    sendRequest(request, (res) => execute(key, request, res, resolve, reject));
  });
}
