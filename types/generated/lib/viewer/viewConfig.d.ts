export function WOQLViewRule(): void;
export class WOQLViewRule {
    rule: {};
    constructor: typeof WOQLRule;
    prettyPrint(type: any): string;
    json(mjson: any): WOQLViewRule | {
        pattern: any;
        rule: {};
    };
    size(size: any): any;
    color(color: any): any;
    icon(json: any): any;
    text(json: any): any;
    border(json: any): any;
    renderer(rend: any): any;
    render(func: any): any;
    click(onClick: any): any;
    hover(onHover: any): any;
    hidden(hidden: any): any;
    args(args: any): any;
}
/**
 * Generic functions / configs that are available to all config types
 */
export function ViewConfig(): void;
export class ViewConfig {
    rules: any[];
    render(func: any): any;
    view_render: any;
    renderer(val: any): any;
    view_renderer: any;
    getRulesJSON(): any[];
    getBasicJSON(): {
        render: any;
        renderer: any;
        bindings: any;
    };
    loadBasicJSON(json: any): void;
    vbindings: any;
    getBasicprettyPrint(): string;
    bindings(bindings: any): any;
}
import WOQLRule = require("./woqlRule");
