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
    if (!data || [Blob, ArrayBuffer, FormData, URLSearchParams].some(cls => data instanceof cls)) {
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

  function send(fn) {
    const headers = request.h;
    const xhr = new XMLHttpRequest();
    const query = Object.assign({}, request.q);
    const url = formatURL(request.u, query) + formatQueryString(request.u.indexOf('?') === -1 ? '?' : '&', query);
    self.activeXHR[id] = xhr;
    xhr.open(request.m, url, true);
    for (const header in headers) {
      xhr.setRequestHeader(header, headers[header]);
    }
    xhr.responseType = request.t;
    xhr.send(headers['Content-Type'] === 'application/json' ? JSON.stringify(request.d) : serialize(request.d));
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        const content = xhr.getResponseHeader('Content-Type');
        const { responseURL } = xhr;
        let { response } = xhr;
        delete self.activeXHR[id];
        if (!request.t && content) {
          if (content.indexOf('application/json') !== -1) {
            response = JSON.parse(response);
          } else if (/(application|text)\/xml/.test(content)) {
            response = xhr.responseXML;
          }
        }
        fn({
          id,
          r: response,
          u: responseURL,
          s: xhr.status,
          rd: request.rd && responseURL && responseURL !== url,
          swr: JSON.stringify(response) === request.r.v
        });
      }
    };
  }

  if (request.a) {
    if (self.activeXHR[id]) {
      self.activeXHR[id].abort();
      delete self.activeXHR[id];
    }
    if (self.intervals[id]) {
      clearInterval(self.intervals[id]);
      delete self.intervals[id];
    }
  } else {
    if (typeof request.i === 'number' && !self.intervals[id]) {
      self.intervals[id] = setInterval(() => send((res) => {
        if (!res.swr) {
          callback(res);
          request.r.v = JSON.stringify(res.r);
        }
      }), request.i * 1000);
    } else {
      send(callback);
    }
  }
}
