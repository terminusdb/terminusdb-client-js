export = WOQLTableConfig;
declare function WOQLTableConfig(): void;
declare class WOQLTableConfig {
    type: string;
    constructor: typeof Config.ViewConfig;
    create(client: any): WOQLTable;
    json(): {
        table: {
            column_order: any[] | this;
            pagesize: any;
            renderer: any;
            pager: any;
            bindings: any;
            page: any;
            changesize: any;
        };
        rules: any[];
    };
    loadJSON(config: any, rules: any): WOQLTableConfig;
    rules: WOQLTableRule[];
    prettyPrint(): string;
    renderer(rend: any): any;
    trenderer: any;
    header(theader: any): any;
    theader: any;
    column_order(...val: any[]): any[] | WOQLTableConfig;
    order: any[];
    pager(val: any): any;
    show_pager: any;
    changesize(val: any): any;
    change_pagesize: any;
    pagesize(val: any): any;
    show_pagesize: any;
    page(val: any): any;
    show_pagenumber: any;
    column(...cols: any[]): any;
    row(): any;
}
import Config = require("./viewConfig.js");
import WOQLTable = require("./woqlTable.js");
declare function WOQLTableRule(): void;
declare class WOQLTableRule {
    constructor: typeof Config.WOQLViewRule;
    header(hdr: any): any;
    width(wid: any): any;
    maxWidth(wid: any): any;
    minWidth(wid: any): any;
    unsortable(unsortable: any): any;
    uncompressed(uncompressed: any): any;
    prettyPrint(type: any): any;
}
