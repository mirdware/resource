declare module '@sespesoft/resource' {
    export default class Resource {
        constructor (url: string, header?: Payload)
        get (queryString?: Payload): Promise<Reply>
        post (dataBody: Payload, queryString?: Payload): Promise<Reply>
        put (dataBody: Payload, queryString?: Payload): Promise<Reply>
        delete (queryString?: Payload): Promise<Reply>
        request (method: string, dataBody?: Payload|null, queryString?: Payload): Promise<Reply>
    }
}

declare interface Payload { [x: string]: JSONValue }

declare type JSONValue = string|number|boolean|Payload|JSONArray;

declare type Reply = Payload|JSONArray|void;

declare interface JSONArray extends Array<JSONValue> { }
