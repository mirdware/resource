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
 * @var {ax} activeXHR
 * @var {i_} intervals
 * @var {rv} resultValue
 * @var {l} length
 * @var {i} interval
 * @var {p} progress
 */
export function sendRequest(request, callback) {
  const { id } = request;
  self.ax = self.ax || {};
  self.i_ = self.i_ || {};

  function serialize(data) {
    if (!data || [Blob, ArrayBuffer, URLSearchParams].some(cls => data instanceof cls)) {
      return data;
    }
    const formData = new FormData();
    for (const key in data) {
      if (Array.isArray(data[key])) {
        data[key].forEach(v => formData.append(key, v));
      } else {
        formData.append(key, data[key]);
}
    }
    return formData;
  }

  function formatQueryString(sign, data) {
    const variables = [];
    for (const key in data) {
      const name = encodeURIComponent(key);
      if (Array.isArray(data[key])) {
        data[key].forEach(element => variables.push(name + '=' + encodeURIComponent(element)));
      } else {
        variables.push(name + '=' + encodeURIComponent(data[key]));
      }
    }
    return variables.length ? sign + variables.join('&') : '';
  }

  function formatURL(url, data) {
    for (const key in data) {
      const variable = '/{' + key + '}';
      if (!Array.isArray(data[key]) && url.includes(variable)) {
        url = url.replace(variable, '/' + encodeURIComponent(data[key]));
        delete data[key];
      }
    }
    return url.replace(/\/\{(\w+)\}/gi, '');
  }

  function toObject(params) {
    const obj = {};
    params.forEach((value, key) => {
      if (obj[key] !== undefined) {
        if (!Array.isArray(obj[key])) {
          obj[key] = [obj[key]];
        }
        obj[key].push(value);
      } else {
        obj[key] = value;
      }
    });
    return obj;
  }

  function abort() {
    if (self.ax[id]) {
      self.ax[id].abort();
      delete self.ax[id];
    }
    if (self.i_[id]) {
      clearInterval(self.i_[id]);
      delete self.i_[id];
    }
  }

  function establish() {
    if (request.i && !self.i_[id]) {
      let seq = 0;
      return self.i_[id] = setInterval(() => {
        const mine = ++seq;
        send((res) => {
          if (mine === seq && res.s > 0 && !res.swr) {
            callback(res);
            request.r.v = res.rv;
          }
        });
      }, request.i * 1000);
    }
    send(callback);
  }

  function send(fn) {
    const headers = request.h;
    const xhr = new XMLHttpRequest();
    const query = request.q instanceof URLSearchParams ? toObject(request.q) : Object.assign({}, request.q);
    const url = formatURL(request.u, query) + formatQueryString(request.u.indexOf('?') === -1 ? '?' : '&', query);
    let type = request.t?.toLowerCase();
    let contentType = '';
    self.ax[id] = xhr;
    xhr.open(request.m, url, true);
    for (const name in request.h) {
      if (name.toLowerCase() === 'content-type') {
        contentType = headers[name].toLowerCase();
      }
      xhr.setRequestHeader(name, headers[name]);
    }
    xhr.responseType = type === "document" ? "text" : type;
    xhr.timeout = request.to * 1000;
    xhr.withCredentials = request.wc;
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        callback({ id, l: e.loaded, p: e.total });
      }
    };
    xhr.send(contentType.startsWith('application/json') ? JSON.stringify(request.d) : serialize(request.d));
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4) {
        const headers = {};
        delete self.ax[id];
        xhr.getAllResponseHeaders().split("\r\n").forEach(line => {
          if (!line) return
          const index = line.indexOf(":");
          headers[line.substring(0, index).trim().toLowerCase()] = line.substring(index + 1).trim();
        });
        const { responseURL } = xhr;
        let { response } = xhr;
        let responseValue = response;
        if (type === "text") {
          const mime = headers['content-type'];
          if (mime) {
            if (mime.startsWith("application/json")) {
              try {
                response = JSON.parse(response);
                type = "json";
              } catch(e) { }
            }  else if (/(application|text)\/xml/.test(mime)) {
              type = "document";
            }
          }
        } else {
          if (type === "blob") {
            responseValue = { $t: "blob", $s: responseValue.size, $m: responseValue.type };
          } else if (type === "arraybuffer") {
            responseValue = { $t: "ab", $s: responseValue.byteLength }
          }
          try { responseValue = JSON.stringify(responseValue) } catch { }
        }
        fn({
          id,
          h: headers,
          r: response,
          u: responseURL,
          s: xhr.status,
          rd: request.rd && responseURL && responseURL !== url,
          rv: responseValue,
          t: type,
          swr: responseValue === request.r?.v
        });
      }
    };
  }

  request.a ? abort() : establish();
}
