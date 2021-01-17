export namespace standard_urls {
    const rdf: string;
    const rdfs: string;
    const xsd: string;
    const xdd: string;
    const owl: string;
    const system: string;
    const vio: string;
    const repo: string;
    const layer: string;
    const woql: string;
    const ref: string;
    const api: string;
}
export function URIEncodePayload(payload: any): string;
export function addURLPrefix(prefix: any, url: any): void;
export function empty(obj: any): boolean;
export function genBNID(base: any): string;
export function getShorthand(link: any): string | false;
export function compareIDs(ida: any, idb: any): boolean;
export function shorten(url: any, prefixes: any): any;
export function unshorten(url: any): any;
export function validURL(str: any): boolean;
export function isIRI(str: any, context: any, allow_shorthand: any): boolean;
export function labelFromURL(url: any): any;
export function labelFromVariable(v: any): any;
export function urlFragment(url: any): any;
export function lastURLBit(url: any): any;
export function getStdURL(pref: any, ext: any, url: any): any;
export function addNamespacesToVariables(vars: any): any[];
export function addNamespaceToVariable(v: any): any;
export function removeNamespaceFromVariable(mvar: any): any;
export function removeNamespacesFromVariables(vars: any): any[];
export function getConfigValue(val: any, row: any): any;
export namespace TypeHelper {
    function isStringType(stype: any): boolean;
    function isDatatype(stype: any): boolean;
    function numberWithCommas(value: any, separator: any): any;
    function formatBytes(bytes: any, decimals?: number): string;
    const datatypes: string[];
    function parseRangeValue(val: any, dividor: any): any;
}
export namespace DateHelper {
    function parseXsdTime(val: any): {};
    function parseXsdDate(val: any): false | {
        year: any;
        month: any;
        day: any;
        timezone: string | boolean;
    };
    function parseDate(ty: any, value: any): {};
    function addXsdPadding(parsed: any): {
        year: any;
        month: any;
        day: any;
        hour: any;
        minute: any;
        second: any;
    };
    function xsdFromParsed(parsed: any, ty: any): any;
    function convertTimestampToXsd(val: any): {
        year: number;
        month: number;
        day: number;
        hour: number;
        minute: number;
        second: number;
    };
    function parseXsdDateTime(val: any): {};
    function extractXsdTimezone(val: any): false | "Z";
}
