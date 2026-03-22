import Endpoint, { privy, mergeOptions } from "./endpoint";
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
    let worker;
    if (typeof Worker !== "undefined") {
      const blobURL = URL.createObjectURL(
        new Blob(['self.onmessage=function(e){(' + sendRequest + ')(e.data,self.postMessage)}'])
      );
      worker = new Worker(blobURL);
      URL.revokeObjectURL(blobURL);
    }
    super({
      u: url,
      w:  worker,
      rd: options.redirect ?? true,
      t: options.type || '',
      swr: options.swr,
      c: options.cache,
      to: options.timeout || 0,
      wc: options.withCredentials,
      h: Object.assign({
        'X-Requested-With': 'XMLHttpRequest'
      }, options.headers || {})
    });
  }

  add(path, options) {
    const properties = privy.get(this);
    options = mergeOptions(properties, options);
    options.u = (properties.u + '/' + path).replace(/([^:]\/)\/+/g, "$1");
    return new Endpoint(options);
  }
}
