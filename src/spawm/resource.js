import Endpoint from "./endpoint";
import { privy } from "./cache";
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
      swr: options.swr,
      c: options.cache,
      h: Object.assign({
        'X-Requested-With': 'XMLHttpRequest'
      }, options.headers || {})
    });
  }

  add(path, options) {
    const parent = privy.get(this);
    const properties = Object.assign({}, parent, {
      h: Object.assign({}, parent.h),
      u: parent.u + path
    });
    if (options) {
      const props = { redirect: 'rd', type: 't', cache: 'c', swr: 'swr' };
      for (const key in props) {
        if (options[key] !== undefined) {
          properties[props[key]] = options[key];
        }
      }
      Object.assign(properties.h, options.headers || {});
    }
    return new Endpoint(properties);
  }
}
