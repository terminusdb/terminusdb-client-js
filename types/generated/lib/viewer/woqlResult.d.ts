export = WOQLResult;
/**
 * @file WOQL Result Object
 * @license Apache Version 2
 * Object representing the result of a WOQL Query
 * @param {Object} results result JSON object as returned by WOQL query
 * @param {WOQLQuery} query the query object that generated the result
 * @param {Object} [config] optional result configuration options object
 *                 [config.no_compress] by default all URLs are compressed where possible (v:X rather than http://.../variable/x) set to true to return non-compressed values
 *                 [config.context] specify the JSON-LD context to use for compressing results - by default the query context will be used
 */
declare function WOQLResult(results: any, query: any, config?: any): void;
declare class WOQLResult {
    /**
     * @file WOQL Result Object
     * @license Apache Version 2
     * Object representing the result of a WOQL Query
     * @param {Object} results result JSON object as returned by WOQL query
     * @param {WOQLQuery} query the query object that generated the result
     * @param {Object} [config] optional result configuration options object
     *                 [config.no_compress] by default all URLs are compressed where possible (v:X rather than http://.../variable/x) set to true to return non-compressed values
     *                 [config.context] specify the JSON-LD context to use for compressing results - by default the query context will be used
     */
    constructor(results: any, query: any, config?: any);
    bindings: any;
    insert_count: any;
    delete_count: any;
    transaction_retry_count: any;
    variable_names: any;
    query: any;
    cursor: number;
    compress(context?: any): WOQLResult;
    hasBindings(): boolean;
    hasUpdates(): boolean;
    getBindings(): any;
    rows(): any;
    getVariableList(): any;
    count(): any;
    inserts(): any;
    deletes(): any;
    first(): any;
    last(): any;
    next(): any;
    prev(): any;
    sort(key: any, asc_or_desc: any): void;
    compareValues(a: any, b: any, asc_or_desc?: string): 1 | -1 | 0;
}
