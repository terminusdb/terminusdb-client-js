export = WOQLTable;
/**
 * @file WOQL Table
 * @license Apache Version 2
 */
declare function WOQLTable(client: any, config: any): this;
declare class WOQLTable {
    /**
     * @file WOQL Table
     * @license Apache Version 2
     */
    constructor(client: any, config: any);
    client: any;
    config: any;
    options(config: any): WOQLTable;
    setResult(res: any): WOQLTable;
    result: any;
    count(): any;
    first(): any;
    prev(): any;
    next(): any;
    canAdvancePage(): boolean;
    canChangePage(): boolean;
    canRetreatPage(): boolean;
    getPageSize(): any;
    setPage(l: any): any;
    getPage(): any;
    setPageSize(l: any): any;
    nextPage(): any;
    firstPage(): any;
    previousPage(): any;
    getColumnsToRender(): any;
    getColumnHeaderContents(colid: any): any;
    hidden(col: any): any;
    update(nquery: any): any;
    hasDefinedEvent(row: any, key: any, scope: any, action: any, rownum: any): boolean;
    getDefinedEvent(row: any, key: any, scope: any, action: any, rownum: any): any;
    getRowClick(row: any): any;
    uncompressed(row: any, col: any): any;
    getCellClick(row: any, col: any): any;
    getRowHover(row: any): any;
    getCellHover(row: any, key: any): any;
    getColumnOrder(): any;
    bindings(): any;
    getColumnDimensions(key: any): {
        width: any;
        maxWidth: any;
        minWidth: any;
    };
    hasColumnOrder: any;
    hasCellClick: any;
    hasRowClick: any;
    hasCellHover: any;
    hasRowHover: any;
    getRenderer(key: any, row: any, rownum: any): any;
    isSortableColumn(key: any): boolean;
    renderValue(renderer: any, val: any, key: any, row: any): any;
    getRendererForDatatype(val: any): any;
    getSpecificRender(key: any, row: any): any;
}
