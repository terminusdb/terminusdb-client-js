export = WOQLQuery;
/**
 * @file defines the internal functions of the woql query object - the language API is defined in WOQLQuery
 *
 * @constructor
 * @param {object} [query] json-ld query for initialisation
 */
declare function WOQLQuery(query?: object): this;
declare class WOQLQuery {
    /**
     * @file defines the internal functions of the woql query object - the language API is defined in WOQLQuery
     *
     * @constructor
     * @param {object} [query] json-ld query for initialisation
     */
    constructor(query?: object);
    query: any;
    errors: any[];
    cursor: any;
    chain_ended: boolean;
    contains_update: boolean;
    paging_transitive_properties: string[];
    update_operators: string[];
    vocab: {
        type: string;
        label: string;
        Class: string;
        DatatypeProperty: string;
        ObjectProperty: string;
        Document: string;
        abstract: string;
        comment: string;
        range: string;
        domain: string;
        subClassOf: string;
        string: string;
        integer: string;
        decimal: string;
        boolean: string;
        email: string;
        json: string;
        dateTime: string;
        date: string;
        coordinate: string;
        line: string;
        polygon: string;
    };
    tripleBuilder: boolean;
    parameterError(msg: any): WOQLQuery;
    hasErrors(): boolean;
    addSubQuery(Subq: any): WOQLQuery;
    containsUpdate(json: any): any;
    updated(): WOQLQuery;
    jlt(val: any, type: any): {
        '@type': any;
        '@value': any;
    };
    varj(varb: any): any;
    jobj(qobj: any): any;
    asv(colname_or_index: any, vname: any, type: any): {
        '@type': string;
        'woql:index': {
            '@type': any;
            '@value': any;
        };
        'woql:identifier': {
            '@type': any;
            '@value': any;
        };
        'woql:variable_name': {
            '@type': string;
            '@value': any;
        };
        'woql:var_type': {
            '@type': any;
            '@value': any;
        };
    };
    addASV(cursor: any, asv: any): void;
    wform(opts: any): WOQLQuery;
    arop(arg: any): any;
    vlist(list: any): {};
    wlist(wvar: any, string_only: any): {
        '@type': string;
        'woql:variable_name': {
            '@value': any;
            '@type': string;
        };
        'woql:node'?: undefined;
    } | {
        '@type': string;
        'woql:node': any;
        'woql:variable_name'?: undefined;
    } | {
        '@type': string;
        'woql:array_element': any[];
    };
    qle(query: any, i: any): {
        '@type': string;
        'woql:index': {
            '@type': any;
            '@value': any;
        };
        'woql:query': any;
    };
    cleanSubject(s: any): any;
    cleanPredicate(p: any): any;
    wellKnownPredicate(p: any): boolean;
    cleanPathPredicate(p: any): boolean;
    cleanObject(o: any, t: any): any;
    looksLikeClass(o: any): boolean;
    cleanGraph(g: any): {
        '@type': string;
        '@value': any;
    };
    expandVariable(varname: any, always: any): {
        '@type': string;
        'woql:variable_name': {
            '@value': any;
            '@type': string;
        };
        'woql:node'?: undefined;
    } | {
        '@type': string;
        'woql:node': any;
        'woql:variable_name'?: undefined;
    };
    cleanClass(c: any, stringonly: any): any;
    cleanType(t: any, stringonly: any): any;
    defaultContext(DB_IRI: any): {
        scm: string;
        doc: string;
    };
    getContext(q: any): any;
    context(c: any): void;
    loadDefaultVocabulary(): {
        type: string;
        label: string;
        Class: string;
        DatatypeProperty: string;
        ObjectProperty: string;
        Document: string;
        abstract: string;
        comment: string;
        range: string;
        domain: string;
        subClassOf: string;
        string: string;
        integer: string;
        decimal: string;
        boolean: string;
        email: string;
        json: string;
        dateTime: string;
        date: string;
        coordinate: string;
        line: string;
        polygon: string;
    };
    setVocabulary(vocab: any): void;
    getVocabulary(vocab: any): {
        type: string;
        label: string;
        Class: string;
        DatatypeProperty: string;
        ObjectProperty: string;
        Document: string;
        abstract: string;
        comment: string;
        range: string;
        domain: string;
        subClassOf: string;
        string: string;
        integer: string;
        decimal: string;
        boolean: string;
        email: string;
        json: string;
        dateTime: string;
        date: string;
        coordinate: string;
        line: string;
        polygon: string;
    };
    loadVocabulary(client: any): void;
    execute(client: any, commit_msg: any): any;
    json(json: any): any;
    prettyPrint(clang: string): any;
    wrapCursorWithAnd(): void;
    findLastSubject(json: object): any;
    findLastProperty(json: object): any;
    _is_property_triple(pred: any, obj: any): boolean;
    compilePathPattern(pat: any): any;
}
