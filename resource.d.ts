declare module '@spawm/resource' {
    export default class Resource extends Endpoint {
        constructor(url: string, options?: Options);
        add(path: string, options?: Options): Endpoint;
    }

    export class Endpoint {
        get(query?: QueryParams, options?: Options): AbortablePromise<ResponsePayload>;
        post(body: RequestPayload, query?: QueryParams, options?: Options): AbortablePromise<ResponsePayload>;
        put(body: RequestPayload, query?: QueryParams, options?: Options): AbortablePromise<ResponsePayload>;
        patch(body: RequestPayload, query?: QueryParams, options?: Options): AbortablePromise<ResponsePayload>;
        delete(query?: QueryParams, options?: Options): AbortablePromise<ResponsePayload>;
        send(method: string, body?: RequestPayload, query?: QueryParams, options?: Options): AbortablePromise<ResponsePayload>;
    }

    export interface AbortablePromise<T> extends Promise<T> {
        abort: () => void;
    }

    export interface Options {
        redirect?: boolean;
        cache?: number;
        type?: "arraybuffer" | "blob" | "document" | "json" | "text" | "";
        timeout?: number;
        withCredentials?: boolean;
        onProgress?: (loaded: number, total: number) => void;
        swr?: SwrOptions | null;
        headers?: { [x: string]: string };
    }

    export interface SwrOptions {
        focus?: number;
        reconnect?: number;
        stale?: number;
        onUpdate?: (reply: ResponsePayload, meta: { status: number, headers: { [x: string]: string } }) => void;
    }

    type JSONObject = { [key: string]: JSONValue | JSONObject | Array<JSONObject | JSONValue> };

    type JSONValue = string | number | boolean | null;

    type Payload = JSONObject | Array<JSONObject | JSONValue> | Blob | ArrayBuffer | null;

    type ResponsePayload = Payload | string | Document;

    type QueryParams = { [key: string]: string | number | Array<string | number> } | URLSearchParams;

    type RequestPayload = Payload | { [key: string]: JSONValue | Array<JSONValue | Blob> | Blob } | URLSearchParams;
}
