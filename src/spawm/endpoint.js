import manage from "./request/manage";
import { setStale, validate } from "./request/validate";
import { privy } from "./cache";

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
    const resource = Object.assign(Object.create(Object.getPrototypeOf(this)), this);
    const properties = { swr: {} };
    privy.set(resource, Object.assign(properties, privy.get(this)));
    if (!isNaN(options.focus)) {
      addEventListener('focus', () => validate(resource,'focus', fn, options.focus));
    }
    if (!isNaN(options.reconnect)) {
      addEventListener('online', () => validate(resource, 'oline', fn, options.reconnect));
    }
    if (options.stale) {
      setStale(resource, fn, options.stale);
    }
    return fn(resource);
  }
}
