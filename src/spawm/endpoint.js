import manage from "./request/manage";

export const privy = new WeakMap();

export function mergeOptions(parent, options) {
  options = options || {};
  const props = { redirect: 'rd', type: 't', cache: 'c', timeout: 'to', withCredentials: 'wc' };
  const properties = Object.assign({}, parent, {
    h:  Object.assign({}, parent.h, options.headers || {}),
  });
  if (options.swr !== undefined) {
    properties.swr = options.swr ? Object.assign({}, parent.swr, options.swr) : null;
  }
  for (const key in props) {
    if (options[key] !== undefined) {
      properties[props[key]] = options[key];
    }
  }
  return properties;
}

export default class Endpoint {
  constructor(options) {
    privy.set(this, options);
  }

  get(query, options) {
    return this.send('GET', null, query, options);
  }

  post(body, query, options) {
    return this.send('POST', body, query, options);
  }

  put(body, query, options) {
    return this.send('PUT', body, query, options);
  }

  delete(query, options) {
    return this.send('DELETE', null, query, options);
  }

  patch(body, query, options) {
    return this.send('PATCH', body, query, options);
  }

  send(method, body, query, options) {
    options = mergeOptions(privy.get(this), options);
    return manage(options, method, body, query);
  }
}
