declare module '@spawm/resource' {
    export default class Resource<T = ResponsePayload> extends Endpoint<T> {
        constructor(url: string, options?: Options<T>);
        add<NewT = T>(path: string, options?: Options<NewT>): Endpoint<NewT>;
    }

    export class Endpoint<T = ResponsePayload> {
        get(query?: QueryParams, options?: Options<T>): AbortablePromise<T>;
        post(body: RequestPayload, query?: QueryParams, options?: PartialOptions): AbortablePromise<T>;
        put(body: RequestPayload, query?: QueryParams, options?: PartialOptions): AbortablePromise<T>;
        patch(body: RequestPayload, query?: QueryParams, options?: PartialOptions): AbortablePromise<T>;
        delete(query?: QueryParams, options?: PartialOptions): AbortablePromise<T>;
        send(method: string, body?: RequestPayload, query?: QueryParams, options?: Options<T>): AbortablePromise<T>;
    }

    export interface AbortablePromise<T> extends Promise<T> {
        abort: () => void;
    }

    export interface PartialOptions {
        redirect?: boolean;
        type?: 'arraybuffer' | 'blob' | 'document' | 'json' | 'text';
        timeout?: number;
        withCredentials?: boolean;
        onDownloading?: (loaded: number, total: number) => void;
        onUploading?: (loaded: number, total: number) => void;
        headers?: { [x: string]: string };
    }

    export interface Options<T = ResponsePayload> extends PartialOptions {
        cache?: number;
        swr?: null | {
            focus?: number;
            reconnect?: number;
            stale?: number;
            onUpdate?: (reply: T, meta: { status: number, headers: { [x: string]: string } }) => void;
        }
    }

    type JSONObject = { [key: string]: JSONValue | JSONObject | Array<JSONObject | JSONValue> };

    type JSONValue = string | number | boolean | null;

    type Payload = JSONObject | Array<JSONObject | JSONValue> | Blob | ArrayBuffer | null;

    type ResponsePayload = Payload | string | Document;

    type QueryParams = { [key: string]: string | number | Array<string | number> } | URLSearchParams;

    type RequestPayload = Payload | { [key: string]: JSONValue | Array<JSONValue | Blob> | Blob } | URLSearchParams;
}
