export = WOQLGraphConfig;
declare function WOQLGraphConfig(): void;
declare class WOQLGraphConfig {
    type: string;
    constructor: typeof Config.ViewConfig;
    create(client: any): WOQLGraph;
    literals(v: any): any;
    show_literals: any;
    source(v: any): any;
    source_variable: any;
    fontfamily(v: any): any;
    fontfam: any;
    show_force(v: any): any;
    force: any;
    fix_nodes(v: any): any;
    fixed: any;
    explode_out(v: any): any;
    explode: any;
    selected_grows(v: any): any;
    bigsel: any;
    width(size: any): any;
    gwidth: any;
    height(size: any): any;
    gheight: any;
    edges(...edges: any[]): any[][] | WOQLGraphConfig;
    show_edges: any[][];
    edge(source: any, target: any): any;
    node(...cols: any[]): WOQLGraphRule;
    loadJSON(config: any, rules: any): void;
    rules: WOQLGraphRule[];
    prettyPrint(): string;
    json(): {
        graph: {
            literals: any;
            source: any;
            fontfamily: any;
            show_force: any;
            fix_nodes: any;
            explode_out: any;
            selected_grows: any;
            width: any;
            height: any;
            edges: any[][] | this;
        };
        rules: any[];
    };
}
import Config = require("./viewConfig.js");
import WOQLGraph = require("./woqlGraph.js");
declare function WOQLGraphRule(scope: any): void;
declare class WOQLGraphRule {
    constructor(scope: any);
    constructor: typeof Config.WOQLViewRule;
    charge(v: any): any;
    collisionRadius(v: any): any;
    arrow(json: any): any;
    distance(d: any): any;
    symmetric(d: any): any;
    weight(w: any): any;
    prettyPrint(type: any): any;
}
