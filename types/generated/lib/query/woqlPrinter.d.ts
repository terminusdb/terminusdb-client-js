export = WOQLPrinter;
/**
 * Class responsible for converting a JSON WOQL into a WOQL.js / WOQL.py string
 */
declare function WOQLPrinter(vocab: any, language: any): void;
declare class WOQLPrinter {
    /**
     * Class responsible for converting a JSON WOQL into a WOQL.js / WOQL.py string
     */
    constructor(vocab: any, language: any);
    vocab: any;
    language: any;
    indent_spaces: number;
    boxed_predicates: string[];
    subject_cleaned_predicates: string[];
    schema_cleaned_predicates: string[];
    list_operators: string[];
    query_list_operators: string[];
    operator_maps: {
        IDGenerator: string;
        IsA: string;
        PostResource: string;
        FileResource: string;
        RemoteResource: string;
        AsVars: string;
        NamedAsVars: string;
        IndexedAsVars: string;
    };
    shortcuts: {
        optional: string;
        substring: string;
        regexp: string;
        subsumption: string;
        equals: string;
        concatenate: string;
    };
    pythonic: {
        and: string;
        or: string;
        as: string;
        with: string;
        from: string;
        not: string;
    };
    show_context: boolean;
    printJSON(json: any, level: any, fluent: any, newline: any): any;
    getArgumentOrder(operator: any, json: any): string[];
    argumentTakesNewline(operator: any): boolean;
    argumentRequiresArray(predicate: any, entries: any): boolean;
    printArgument(operator: any, predicate: any, arg: any, level: any, fluent: any): string;
    decompileRegexPattern(json: any): string;
    plit(json: any): any;
    pvar(json: any): string | false;
    getWOQLPrelude(operator: any, fluent: any, inline: any): any;
    uncleanArgument(arg: any, operator: any, predicate: any): string;
    isListOperator(operator: any): boolean;
    isQueryListOperator(operator: any): boolean;
    getFunctionForOperator(operator: any): any;
    getBoxedPredicate(operator: any, json: any): string | false;
    unboxJSON(operator: any, json: any): any;
    decompileAsVars(asvs: any, level: any): string;
    decompileConcatList(pstruct: any): string;
    decompilePathPattern(pstruct: any): any;
}
