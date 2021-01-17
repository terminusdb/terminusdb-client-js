/**
 * @file Terminus Rules
 * @license Apache Version 2
 * Abstract object to support applying matching rules to result sets and documents
 * sub-classes are FrameRule and WOQLRule - this just has common functions
 */
export function TerminusRule(): void;
export class TerminusRule {
    literal(tf: boolean): any;
    type(list_0: any): any;
    scope(scope: any): any;
    value(...val: any[]): any;
    json(mjson: any): TerminusRule | {
        pattern: any;
        rule: any;
    };
    rule: any;
}
/**
 * Contained Pattern Object to encapsulate pattern matching
 * @param {Object} pattern
 */
export function TerminusPattern(pattern: any): void;
export class TerminusPattern {
    /**
     * Contained Pattern Object to encapsulate pattern matching
     * @param {Object} pattern
     */
    constructor(pattern: any);
    setPattern(pattern: any): void;
    literal: any;
    type: any;
    scope: any;
    value: any;
    json(): {
        literal: any;
        type: any;
        scope: any;
        value: any;
    };
    testBasics(scope: any, value: any): boolean;
    testValue(value: any, constraint: any): any;
    unpack(arr: any, nonstring: boolean): string;
    IDsMatch(ida: any, idb: any): boolean;
    classIDsMatch(ida: any, idb: any): boolean;
    propertyIDsMatch(ida: any, idb: any): boolean;
    rangeIDsMatch(ida: any, idb: any): boolean;
    valuesMatch(vala: any, valb: any): boolean;
    numberMatch(vala: any, valb: any): any;
    stringMatch(vala: any, valb: any): boolean;
}
