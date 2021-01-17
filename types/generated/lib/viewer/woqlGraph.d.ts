export = WOQLGraph;
declare function WOQLGraph(client: any, config: any): void;
declare class WOQLGraph {
    constructor(client: any, config: any);
    client: any;
    config: any;
    nodes: any[];
    edges: any[];
    options(config: any): WOQLGraph;
    setResult(result: any): void;
    result: any;
    calculateVariableTypes(): void;
    extractFromBinding(row: any, rownum: any): void;
    addAdornedEdge(source: any, target: any, ks: any, kt: any, row: any): void;
    addAdornedNode(nid: any, k: any, row: any): void;
    getLiteralOwner(nodes: any, v: any, row: any): any;
    createEdgesFromIDs(nodes: any, row: any): void;
    getEdges(): any[];
    combineNodes(nodes: any): any[];
    combineEdges(edges: any): any[];
    nodes_referenced_by_edges: any[];
    getNodes(): any[];
    includeNode(v: any, row: any): boolean;
    includeLiteralNode(variableName: any, row: any): boolean;
    includeRow(row: any, num: any): boolean;
}
