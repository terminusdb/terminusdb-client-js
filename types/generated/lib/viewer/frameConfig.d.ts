export = FrameConfig;
/**
 * @file Frame Config
 * @license Apache Version 2
 */
declare function FrameConfig(): void;
declare class FrameConfig {
    type: string;
    constructor: typeof Config.ViewConfig;
    create(client: any): DocumentFrame;
    prettyPrint(): string;
    json(): {
        frame: any;
        rules: any;
    };
    loadJSON(config: any, rules: any): FrameConfig;
    rules: DocumentRule[];
    json_rules(): any[];
    load_schema(tf: any): any;
    get_schema: any;
    show_all(r: any): FrameConfig;
    show_parts(o: any, p: any, d: any): FrameConfig;
    object(): any;
    property(): any;
    scope(scope: any): any;
    data(): any;
    all(): any;
    setFrameDisplayOptions(frame: any, rule: any): void;
    setFrameFeatures(existing: any, fresh: any): any;
    setFrameArgs(existing: any, fresh: any): any;
}
import Config = require("./viewConfig.js");
import DocumentFrame = require("./documentFrame.js");
/**
 * @file Document Rule
 * @license Apache Version 2
 */
declare function DocumentRule(): void;
declare class DocumentRule {
    rule: {};
    constructor: typeof FrameRule;
    renderer(rend: any): any;
    compare(func: any): any;
    mode(mode: any): any;
    collapse(func: any): any;
    view(m: any): any;
    showDisabledButtons(m: any): any;
    header(m: any): any;
    errors(errs: any): any;
    headerStyle(m: any): any;
    showEmpty(m: any): any;
    dataviewer(m: any): any;
    features(...m: any[]): any;
    headerFeatures(...m: any[]): any;
    render(func: any): any;
    style(style: any): any;
    hidden(m: any): any;
    args(json: any): any;
    applyFeatureProperty(feats: any, prop: any, val: any): {}[];
    unpackFeatures(feats: any): string;
    prettyPrint(): any;
}
import FrameRule = require("./frameRule.js");
