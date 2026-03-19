declare module '@spawm/resource' {
    export default class Resource extends Endpoint {
        constructor(url: string, options?: Options);
        add(path: string, options?: Options): Endpoint;
    }

    export class Endpoint {
        get(query?: Payload, swr?: SwrOptions|null): AbortablePromise<Reply>;
        post(body: Payload, query?: Payload): AbortablePromise<Reply>;
        put(body: Payload, query?: Payload): AbortablePromise<Reply>;
        patch(body: Payload, query?: Payload): AbortablePromise<Reply>;
        delete(query?: Payload): AbortablePromise<Reply>;
        send(method: string, body?: Payload|null, query?: Payload|null, swr?: SwrOptions|null): AbortablePromise<Reply>;
    }

    export interface AbortablePromise<T> extends Promise<T> {
        abort: () => void;
    }

    export interface Options {
        redirect?: boolean;
        cache?: number;
        type?: "arraybuffer" | "blob" | "document" | "json" | "text" | "";
        swr?: SwrOptions;
        headers?: { [x: string]: string };
    }

    export interface SwrOptions {
        focus?: number;
        reconnect?: number;
        stale?: number;
        onUpdate?: (reply: Reply, meta: { status: number }) => void;
    }

    interface Payload { [key: string]: JSONValue };

    type JSONValue = string | number | boolean | Payload | JSONArray | Blob | File | null;

    type Reply = Payload | JSONArray | void | Blob | string | XMLDocument;

    interface JSONArray extends Array<JSONValue> { };
}
