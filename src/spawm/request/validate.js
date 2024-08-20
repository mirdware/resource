import { execute, stop } from "./manage";
import { privy } from "../endpoint";

const next = {};
const stale = {};

export function setStale(resource, callback, time) {
  const { swr, w: worker } = privy.get(resource);
  for (const key in swr) {
    stale[key] = Object.assign({ i: time }, swr[key]);
    execute(worker, stale[key], () => {
      callback(resource);
    }, () => {});
  }
  return () => {
    if (worker) {
      worker.terminate();
    } else {
      Object.keys(swr).forEach((key) => stop(key));
    }
  }
}

export function validate(resource, name, callback, time) {
    const now = new Date();
    const nextDate = next[name];
    if (!nextDate || now > nextDate) {
      const { w: worker, swr } = privy.get(resource);
      let willExecuted = false;
      let i = 0;
      for (const key in swr) {
        execute(worker, swr[key], (_, meta) => {
          i--;
          if (!meta.swr) willExecuted = true;
          if (!i && willExecuted) callback(resource);
        }, () => { i-- });
        i++;
      }
      next[name] = new Date(now.getTime() + 1000 * time);
    }
}
