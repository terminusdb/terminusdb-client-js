export = WOQLChooserConfig;
declare function WOQLChooserConfig(): void;
declare class WOQLChooserConfig {
    type: string;
    constructor: typeof Config.ViewConfig;
    create(client: any): WOQLChooser;
    prettyPrint(): string;
    json(): {
        chooser: any;
        rules: any;
    };
    loadJSON(config: any, rules: any): void;
    rules: WOQLChooserRule[];
    change(v: any): any;
    onChange: any;
    show_empty(p: any): any;
    placeholder: any;
    rule(v: any): any;
    values(v: any): any;
    value_variable: any;
    labels(v: any): any;
    label_variable: any;
    titles(v: any): any;
    title_variable: any;
    sort(v: any): any;
    sort_variable: any;
    direction(v: any): any;
    sort_direction: any;
}
import Config = require("./viewConfig.js");
import WOQLChooser = require("./woqlChooser.js");
declare function WOQLChooserRule(scope: any): void;
declare class WOQLChooserRule {
    constructor(scope: any);
    constructor: typeof Config.WOQLViewRule;
    label(l: any): any;
    title(l: any): any;
    values(l: any): any;
    selected(s: any): any;
    prettyPrint(type: any): any;
}
