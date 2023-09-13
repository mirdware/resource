import manage from "./request/manage";
import { privy } from "./cache";

const next = {};

function validate(resource, name, callback, time) {
    const now = new Date();
    const nextDate = next[name];
    if (!nextDate || now > nextDate) {
        callback(resource);
        next[name] = new Date(now.getTime() + 1000 * time);
    }
}

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
    if (!isNaN(options.focus)) {
      addEventListener('focus', () => validate(this,'focus', fn, options.focus));
    }
    if (!isNaN(options.reconnect)) {
      addEventListener('online', () => validate(this, 'oline', fn, options.reconnect));
    }
    return fn(this);
  }
}
