export = WOQLStreamConfig;
declare function WOQLStreamConfig(): void;
declare class WOQLStreamConfig {
    type: string;
    constructor: typeof Config.ViewConfig;
    create(client: any): WOQLStream;
    row(): any;
    template(template: any): any;
    mtemplate: any;
    prettyPrint(): string;
    loadJSON(config: any, rules: any): void;
    rules: WOQLStreamRule[];
    json(): {
        stream: {
            template: any;
        };
        rules: any[];
    };
}
import Config = require("./viewConfig.js");
import WOQLStream = require("./woqlStream.js");
declare function WOQLStreamRule(): void;
declare class WOQLStreamRule {
    constructor: typeof Config.WOQLViewRule;
    template(template: any): any;
}
