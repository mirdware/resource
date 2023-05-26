declare module '@spawm/resource' {
    export default class Resource extends Endpoint {
        constructor (url: string, options?: Options)
        add(options: Options): Endpoint
    }
}

class Endpoint {
    get(queryString?: Payload): Promise<Reply>
    post(dataBody: Payload, queryString?: Payload): Promise<Reply>
    put(dataBody: Payload, queryString?: Payload): Promise<Reply>
    delete(queryString?: Payload): Promise<Reply>
    send(method: string, dataBody?: Payload|null, queryString?: Payload): Promise<Reply>
}

declare interface Options {
    path?: string,
    redirect?: boolean,
    type?: string,
    headers?: { [x: string]: string }
}

declare interface Payload { [x: string]: JSONValue }

declare type JSONValue = string|number|boolean|Payload|JSONArray;

declare type Reply = Payload|JSONArray|void|Blob|string|XMLDocument;

declare interface JSONArray extends Array<JSONValue> { }
