export = WOQLStream;
declare function WOQLStream(client: any, config: any): this;
declare class WOQLStream {
    constructor(client: any, config: any);
    client: any;
    config: any;
    options(config: any): WOQLStream;
    setResult(wqrs: any): void;
    result: any;
}
