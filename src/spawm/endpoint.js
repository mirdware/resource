import manage from "./request/manage";
import { privy } from "./cache";

export default class Endpoint {
  constructor(options) {
    privy.set(this, options);
  }

  get(query, swr) {
    return this.send('GET', null, query, swr);
  }

  post(body, query) {
    return this.send('POST', body, query)
  }

  put(body, query) {
    return this.send('PUT', body, query);
  }

  delete(query) {
    return this.send('DELETE', null, query);
  }

  patch(body, query) {
    return this.send('PATCH', body, query);
  }

  send(method, body, query, swr) {
    const options = Object.assign({}, privy.get(this));
    options.swr = swr === null ? null : Object.assign({}, options.swr, swr);
    return manage(options, method, body, query);
  }
}
