const LIMIT = 100;
const cache = new Map();

export function set(key, value) {
    if (cache.has(key)) cache.delete(key);
    if (cache.size >= LIMIT) {
        let min = Infinity;
        for (const entry of cache.values()) {
            if (entry.f < min) min = entry.f;
        }
        for (const [k, v] of cache) {
            cache.delete(k);
            if (v.f > min) {
                v.f -= min + 1;
                cache.set(k, v);
            }
            if (cache.size < LIMIT) break;
        }
    }
    cache.set(key, { v: JSON.stringify(value), f: 0 });
}

export function get(key) {
    const entry = cache.get(key);
    if (!entry) return null;
    entry.f++;
    return JSON.parse(entry.v);
}

export const privy = new WeakMap();
