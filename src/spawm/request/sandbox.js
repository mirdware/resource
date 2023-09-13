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
export function sendRequest(request, callback) {
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
  xhr.responseType = request.t;
  xhr.send(headers['Content-Type'] === 'application/json' ? JSON.stringify(request.d) : serialize(request.d));
  xhr.onreadystatechange = () => {
    if (xhr.readyState === 4) {
      const content = xhr.getResponseHeader('Content-Type');
      const { responseURL } = xhr;
      let { response } = xhr;
      if (!request.t && content) {
        if (content.indexOf('application/json') !== -1) {
          response = JSON.parse(response);
        } else if (/(application|text)\/xml/.test(content)) {
          response = xhr.responseXML;
        }
      }
      callback({
        id: request.id,
        r: response,
        u: responseURL,
        s: xhr.status,
        rd: request.rd && responseURL !== url
      });
    }
  };
}