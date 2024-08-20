import manage from "./request/manage";
import { sendRequest } from "./request/sandbox";
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
    let fnFocus, fnConnect, fnStop;
    const priv = privy.get(this);
    const { focus, reconnect, stale } = options;
    const resource = Object.create(Object.getPrototypeOf(this));
    privy.set(resource, Object.assign({swr: {}}, priv));
    resource.stop = function () {
      fnFocus && removeEventListener('focus', fnFocus);
      fnConnect && removeEventListener('online', fnConnect);
      if (stale) {
        fnStop();
        if (priv.w) {
          priv.w = new Worker(URL.createObjectURL(
            new Blob(['self.onmessage=function(e){(' + sendRequest + ')(e.data,self.postMessage)}'])
          ))
        }
      }
    }
    if (!isNaN(focus)) {
      fnFocus = function () {
        validate(resource, 'focus', fn, focus);
      };
      addEventListener('focus', fnFocus);
    }
    if (!isNaN(reconnect)) {
      fnConnect = function () {
        validate(resource, 'oline', fn, reconnect);
      };
      addEventListener('online', fnConnect);
    }
    fn(resource).then(() => {
      if (stale) {
        fnStop = setStale(resource, fn, stale)
      }
    });
    return resource;
  }
}
