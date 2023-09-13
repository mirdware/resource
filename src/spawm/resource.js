import manage from "./request/manage";
import { sendRequest } from "./request/sandbox";

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
 */
const privy = new WeakMap();

function createWorker() {
  if (Worker){
    const blob = new Blob(['self.onmessage=function(e){(' + sendRequest + ')(e.data,self.postMessage)}']);
    const worker = new Worker(URL.createObjectURL(blob));
    return worker;
  }
}

class Endpoint {
  constructor(options) {
    privy.set(this, options);
  }

  get(queryString) {
    return this.send('GET', null, queryString);
  }

  post(dataBody, queryString) {
    return this.send('POST', dataBody, queryString)
  }

  put(dataBody, queryString) {
    return this.send('PUT', dataBody, queryString);
  }

  delete(queryString) {
    return this.send('DELETE', null, queryString);
  }

  patch(dataBody, queryString) {
    return this.send('PATCH', dataBody, queryString);
  }

  send(method, dataBody, queryString) {
    return manage(privy.get(this), method, dataBody, queryString);
  }
}

export default class Resource extends Endpoint {
  constructor(url, options) {
    options = options || {};
    super({
      u: url,
      rd: options.redirect ?? true,
      t: options.type ?? '',
      w: createWorker(),
      c: options.cache,
      h: Object.assign({
        'X-Requested-With': 'XMLHttpRequest'
      }, options.headers || {})
    });
  }

  add(options) {
    const properties = Object.assign({}, privy.get(this));
    options.path && (properties.u += options.path);
    options.redirect && (properties.rd = options.redirect);
    options.type && (properties.t = options.type);
    options.header && Object.assign(properties.h, options.header);
    return new Endpoint(properties);
  }
}
