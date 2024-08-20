import Endpoint from "./endpoint";
import { privy } from "./endpoint";
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
 * @var {w} worker
 */

export default class Resource extends Endpoint {
  constructor(url, options) {
    options = options || {};
    super({
      u: url,
      w: Worker ? new Worker(URL.createObjectURL(
        new Blob(['self.onmessage=function(e){(' + sendRequest + ')(e.data,self.postMessage)}'])
      )) : null,
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
    options = options || {};
    return new Endpoint({
      u: properties.u + url,
      h: Object.assign({}, properties.h, options.headers ?? {}),
      rd: options.redirect ?? properties.rd,
      c: options.cache ?? properties.c,
      t: options.type ?? properties.t
    });
  }
}
