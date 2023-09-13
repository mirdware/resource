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
 * @var {nd} nextDate
 */
const fn = {};
const cache = {};

function solve(xhr, resolve, reject) {
  if (xhr.rd) return location = xhr.u;
  (xhr.s > 399) ? reject(xhr.r, xhr.s) : resolve(xhr.r, xhr.s);
}

function execute(key, request, response, resolve, reject) {
  if (request !== Infinity && !isNaN(request.c)) {
    response.nd = new Date(new Date().getTime() + 1000 * request.c);
  }
  cache[key] = JSON.stringify(response);
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
    if (cache[key]) {
      const res = JSON.parse(cache[key]);
      if (request.c === Infinity || (res.nd && new Date(res.nd) > new Date())) {
        return solve(res, resolve, reject);
      }
    }
    if (worker) {
      worker.postMessage(request);
      fn[id] = ({ data }) => {
        if (data.id === id) {
          execute(key, request, data, resolve, reject);
          worker.removeEventListener('message', fn[id]);
        }
      };
      return worker.addEventListener('message', fn[id]);
    }
    sendRequest(request, (res) => execute(key, request, res, resolve, reject));
  });
}
