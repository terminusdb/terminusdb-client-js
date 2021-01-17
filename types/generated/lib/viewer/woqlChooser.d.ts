export = WOQLChooser;
declare function WOQLChooser(client: any, config: any): this;
declare class WOQLChooser {
    constructor(client: any, config: any);
    client: any;
    config: any;
    selected: boolean;
    cursor: number;
    options(config: any): WOQLChooser;
    set(id: any): void;
    setResult(result: any): WOQLChooser;
    result: any;
    choices: any[];
    includeRow(row: any, index: any): boolean;
    rowToChoice(row: any, rownum: any): {
        id: any;
    };
    getRowID(row: any): any;
    getLabelFromBinding(row: any, rownum: any): any;
    getTitleFromBinding(row: any, rownum: any): any;
    getSelectedFromBinding(row: any, rownum: any): any;
    render(): any;
    setRenderer(rend: any): WOQLChooser;
    renderer: any;
    getSpecialRenderer(row: any, index: any, type: any): any;
    renderSpecial(rule: any, row: any, rownum: any): any;
    count(): any;
    first(): any;
    next(): any;
    prev(): any;
}
