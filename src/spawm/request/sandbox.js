/**
 *
 * @var {a} abort
 * @var {m} method
 * @var {d} data
 * @var {q} queryString
 * @var {h} headers
 * @var {u} url
 * @var {rd} redirect
 * @var {r} response
 * @var {t} type
 * @var {s} status
 */
export function sendRequest(request, callback) {
  const { id } = request;
  self.activeXHR = self.activeXHR || {};
  self.intervals = self.intervals || {};

  function serialize(data) {
    if (!data || [Blob, ArrayBuffer, URLSearchParams].some(cls => data instanceof cls)) {
      return data;
    }
    const formData = new FormData();
    for (const key in data) {
      formData.append(key, data[key]);
    }
    return formData;
  }

  function formatQueryString(sign, data) {
    const variables = [];
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

  function abort() {
    if (self.activeXHR[id]) {
      self.activeXHR[id].abort();
      delete self.activeXHR[id];
    }
    if (self.intervals[id]) {
      clearInterval(self.intervals[id]);
      delete self.intervals[id];
    }
  }

  function establish() {
    if (request.i && !self.intervals[id]) {
      let seq = 0;
      return self.intervals[id] = setInterval(() => {
        const mine = ++seq;
        send((res) => {
          if (mine === seq && res.s > 0 && !res.swr) {
            callback(res);
            request.r.v = JSON.stringify(res.r);
          }
        });
      }, request.i * 1000);
    }
    send(callback);
  }

  function send(fn) {
    const headers = request.h;
    const xhr = new XMLHttpRequest();
    const query = request.q instanceof URLSearchParams ? Object.fromEntries(request.q) : Object.assign({}, request.q);
    const url = formatURL(request.u, query) + formatQueryString(request.u.indexOf('?') === -1 ? '?' : '&', query);
    let contentType = '';
    self.activeXHR[id] = xhr;
    xhr.open(request.m, url, true);
    for (const name in request.h) {
      if (name.toLowerCase() === 'content-type') {
        contentType = headers[name].toLowerCase();
      }
      xhr.setRequestHeader(name, headers[name]);
    }
    xhr.responseType = request.t;
    xhr.timeout = request.to * 1000;
    xhr.withCredentials = request.wc;
    xhr.send(contentType.startsWith('application/json') ? JSON.stringify(request.d) : serialize(request.d));
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        const headers = {};
        delete self.activeXHR[id];
        xhr.getAllResponseHeaders().trim().split('\r\n').forEach(line => {
            const value = line.split(': ');
            const key = value.shift().toLowerCase();
            headers[key] = value.join(': ');
        });
        const content = headers['content-type'];
        const { responseURL } = xhr;
        let { response } = xhr;
        if (!request.t && content) {
          if (content.indexOf('application/json') !== -1) {
            try { response = JSON.parse(response) } catch(e) { }
          } else if (/(application|text)\/xml/.test(content)) {
            response = xhr.responseXML;
          }
        }
        fn({
          id,
          h: headers,
          r: response,
          u: responseURL,
          s: xhr.status,
          rd: request.rd && responseURL && responseURL !== url,
          swr: JSON.stringify(response) === request.r?.v
        });
      }
    };
  }

  request.a ? abort() : establish();
}
