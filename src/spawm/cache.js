const cache = {};

export function set(key, value) {
    cache[key] = JSON.stringify(value);
}

export function get(key) {
    return cache[key] ? JSON.parse(cache[key]) : null;
}

export const privy = new WeakMap();
