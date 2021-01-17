export = WOQLRule;
/**
 * @file WOQL Rules
 * @license Apache Version 2
 * WOQL Rules support pattern matching on results of WOQL Queries
 */
declare function WOQLRule(): void;
declare class WOQLRule {
    pattern: WOQLPattern;
    constructor: typeof TerminusRule.TerminusRule;
    setVariables(vars: any): WOQLRule;
    current_variable: any;
    vars(...varlist: any[]): WOQLRule;
    v(v: any): any;
    edge(source: any, target: any): WOQLRule;
    rownum(rownum: any): any;
    in(list_0: string | number): WOQLRule;
    filter(tester: Function): WOQLRule;
    matchRow(rules: any, row: any, rownum: any, action: any): any[];
    matchCell(rules: any, row: any, key: any, rownum: any, action: any): any[];
    matchColumn(rules: any, key: any, action: any): any[];
    matchNode(rules: any, row: any, key: any, nid: any, action: any): any[];
    matchPair(rules: any, row: any, keya: any, keyb: any, action: any): any[];
    matchEdge: any;
}
declare namespace WOQLRule {
    export { WOQLPattern };
}
/**
 * Object to encapsulate the matching of woql result patterns - inherits from TerminusRule
 * @param {Object} pattern
 */
declare function WOQLPattern(pattern: any): void;
declare class WOQLPattern {
    /**
     * Object to encapsulate the matching of woql result patterns - inherits from TerminusRule
     * @param {Object} pattern
     */
    constructor(pattern: any);
    constructor: typeof TerminusRule.TerminusPattern;
    prettyPrint(type: any): string;
    matchRow(row: any, rownum: any): boolean;
    matchCell(row: any, key: any, rownum: any): boolean;
    matchNode(row: any, key: any, nid: any): boolean;
    matchColumn(key: any): boolean;
    matchPair(row: any, keya: any, keyb: any): boolean;
    testVariableConstraints(row: any): boolean;
    testVariableConstraint(name: any, val: any): boolean;
    setPattern(pattern: any): void;
    json(): {
        scope: any;
        value: any;
        rownum: any;
        variables: any;
        literal: any;
        type: any;
        constraints: any;
        source: any;
        target: any;
    };
}
import TerminusRule = require("./terminusRule.js");
