import Endpoint from "./endpoint";
import { sendRequest } from "./request/sandbox";
import { privy } from "./endpoint";

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
 * @var {w} worker
 */

export default class Resource extends Endpoint {
  constructor(u, options) {
    options = options || {};
    let w;
    if (Worker){
      w = new Worker(URL.createObjectURL(
        new Blob(['self.onmessage=function(e){(' + sendRequest + ')(e.data,self.postMessage)}'])
      ));
    }
    super({
      w,
      u,
      rd: options.redirect ?? true,
      t: options.type ?? '',
      c: options.cache,
      h: Object.assign({
        'X-Requested-With': 'XMLHttpRequest'
      }, options.headers || {})
    });
  }

  add(url, options) {
    const properties = privy.get(this);
    return new Endpoint({
      u: properties.u + url,
      h: Object.assign({}, properties.h, options.header ?? {}),
      rd: options.redirect ?? properties.rd,
      c: options.cache ?? properties.c,
      type: options.type ?? propperties.t
    });
  }
}
