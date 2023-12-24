import manage from "./request/manage";
import { setStale, validate } from "./request/validate";

export const privy = new WeakMap();

export default class Endpoint {
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

  revalidate(fn, options) {
    const resource = Object.create(Object.getPrototypeOf(this));
    privy.set(resource, Object.assign({swr: {}}, privy.get(this)));
    if (!isNaN(options.focus)) {
      addEventListener('focus', () => {
        validate(resource,'focus', fn, options.focus);
      });
    }
    if (!isNaN(options.reconnect)) {
      addEventListener('online', () => {
        validate(resource, 'oline', fn, options.reconnect);
      });
    }
    if (options.stale) {
      setStale(resource, fn, options.stale);
    }
    return fn(resource);
  }
}
