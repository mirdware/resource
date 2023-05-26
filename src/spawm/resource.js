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
 */

const privy = new WeakMap();

function sendRequest(request, callback) {
  function serialize(data) {
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    return formData;
  }

  function formatQueryString(sign, data) {
    const variables = []
    for (const key in data) {
      variables.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
    }
    return variables.length ? sign + variables.join('&') : '';
  }

  function formatURL(url, data) {
    for (const key in data) {
      const variable = '/{' + key + '}';
      if (url.indexOf(variable) !== -1) {
        url = url.replace(variable, '/' + data[key]);
        delete data[key];
      }
    }
    return url.replace(/\/\{(\w+)\}/gi, '');
  }

  const headers = request.h;
  const xhr = new XMLHttpRequest();
  const url = formatURL(request.u, request.q) + formatQueryString(request.u.indexOf('?') === -1 ? '?' : '&', request.q);
  xhr.open(request.m, url, true);
  for (const header in headers) {
    xhr.setRequestHeader(header, headers[header]);
  }
  request.t && (xhr.responseType = request.t);
  xhr.send(headers['Content-Type'] === 'application/json' ? JSON.stringify(request.d) : serialize(request.d));
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const content = xhr.getResponseHeader('Content-Type');
      const { responseURL } = xhr;
      let { response } = xhr;
      if (!request.t && content) {
        if (content.indexOf('application/json') !== -1) {
          response = JSON.parse(response);
        } else if (/(application|text)\/(ht|x)ml/.test(content)) {
          response = xhr.responseXML;
        }
      }
      callback({
        r: response,
        u: responseURL,
        s: xhr.status,
        rd: request.rd && responseURL !== url
      });
    }
  };
}

function solve(xhr, resolve, reject) {
  if (xhr.rd) return location = xhr.u;
  (xhr.s > 399) ? reject(xhr.r, xhr.s) : resolve(xhr.r, xhr.s);
}

function manage(resource, method, data, queryString) {
  const request = Object.assign(resource, {
    m: method,
    d: data,
    q: queryString
  });
  return new Promise((resolve, reject) => {
    if (Worker) {
      const blob = new Blob(['self.onmessage=function(e){(' + sendRequest + ')(e.data,self.postMessage)}']);
      const worker = new Worker(URL.createObjectURL(blob));
      worker.postMessage(request);
      worker.onmessage = (e) => solve(e.data, resolve, reject);
    } else {
      sendRequest(request, (res) => solve(res, resolve, reject));
    }
  });
}

class Endpoint {
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
}

export default class Resource extends Endpoint {
  constructor(url, options) {
    options = options || {};
    super({
      u: url,
      rd: options.redirect ?? true,
      t: options.type,
      h: Object.assign({
        'X-Requested-With': 'XMLHttpRequest'
      }, options.headers || {})
    });
  }

  add(options) {
    const properties = Object.assign({}, privy.get(this));
    options.path && (properties.u += options.path);
    options.redirect && (properties.rd = options.redirect);
    options.type && (properties.t = options.type);
    options.header && Object.assign(properties.h, options.header);
    return new Endpoint(properties);
  }
}
