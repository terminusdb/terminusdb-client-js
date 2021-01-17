export = DocumentFrame;
/**
 * @file Document Frame
 * @license Apache Version 2
 */
declare function DocumentFrame(client: any, config: any): void;
declare class DocumentFrame {
    /**
     * @file Document Frame
     * @license Apache Version 2
     */
    constructor(client: any, config: any);
    client: any;
    config: any;
    load_schema: boolean;
    options(opts: any): DocumentFrame;
    db(dburl: any): DocumentFrame;
    loadDocument(url: string, encoding: any): Promise<any>;
    loadSchema(cls: any, dbURL: any): any;
    loadComplete(url: string, cls?: string): Promise<any>;
    loadJSON(json: any, type: any): any;
    loadData(jsonld: any, cls: any, classframes: any): void;
    document: ObjectFrame;
    load(classframes: any, doc: any): void;
    loadSchemaFrames(classframes: any, cls: any): void;
    filterFrame(loadRenderer: any): void;
    setErrors(errors: any, frameconf: any): void;
    clearErrors(frameconf: any): void;
    applyRules(doc: any, config: any, mymatch: any): void;
}
import ObjectFrame = require("./objectFrame");
