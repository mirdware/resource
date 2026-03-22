import { execute } from "./manage";

const registry = new Map();
const throttles = new Map();

if (typeof window !== 'undefined') {
  window.addEventListener('focus', () => run('focus'));
  window.addEventListener('online', () => run('reconnect'));
}

export function subscribe(id, data) {
  if (data.swr.stale) {
    const newRequest = Object.assign({ i: data.swr.stale }, data.r);
    newRequest.id = 'i' + newRequest.id;
    execute(data.w, newRequest, null, null, data.swr);
  }
  registry.set(id, data);
}

export function unsubscribe(id) {
  registry.delete(id);
  throttles.delete(id + 'focus');
  throttles.delete(id + 'reconnect');
}

function run(type) {
  const now = Date.now();
  registry.forEach((entry, id) => {
    const time = entry.swr[type === 'focus' ? 'focus' : 'reconnect'];
    if (typeof time === 'number') {
      const throttleKey = id + type;
      const nextExecution = throttles.get(throttleKey) || 0;
      if (now > nextExecution) {
        execute(entry.w, entry.r, null, null, entry.swr);
        throttles.set(throttleKey, now + (time * 1000));
      }
    }
  });
}
