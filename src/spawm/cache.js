const LIMIT = 100;
const cache = new Map();

export function set(key, value) {
    if (cache.has(key)) {
        cache.delete(key);
    } else if (cache.size >= LIMIT) {
        cache.delete(cache.keys().next().value);
    }
    cache.set(key, {
        v: JSON.stringify(value)
    });
}

export function get(key) {
    const entry = cache.get(key);
    if (!entry) return;
    cache.delete(key);
    cache.set(key, entry);
    return JSON.parse(entry.v);
}
