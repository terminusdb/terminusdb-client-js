export = ObjectFrame;
/**
 * @file Javascript Terminus Document Classes
 * @license Apache Version 2
 * Helper classes for accessing documents returned by the Terminus DB API programmatically
 *
 * @example
 * let doc = new TerminusDocument(client);
 *
 * //These set the objects document property and return promises:
 *
 * doc.loadDocument(URL).then(() => console.log(this.document));
 * doc.loadComplete(URL, CLS).then(() => console.log(this.document))
 * doc.loadSchema(cls).then(() => console.log(this.document))
 *
 * //These just set the object's document property
 * doc.loadJSON(json_frames, cls) //console.log(this.document)
 * doc.loadDataFrames(json_frames, cls)
 * doc.loadClassFrames(json_frames, cls)
 * @example
 *
 * @description Represents a frame for programmatic access to object frame, anywhere within a document
 * Recursive data structure where this.children contains an indexed array of object frames
 * and this.dataframes contains a property indexed array of data frames
 * Every object frame carries a reference to its classframe
 * This gives us instructions as to how to create new frames according to the schema
 * After that it's turtles all the way down.
 * @param cls - ID of the class (URL)
 * @param classframe - an array of frames representing a class
 * @param archetypes list of class frames
 * @param parent parent object
 * @returns
 */
declare function ObjectFrame(cls: any, jsonld: any, classframes: any, parent: any): void;
declare class ObjectFrame {
    /**
     * @file Javascript Terminus Document Classes
     * @license Apache Version 2
     * Helper classes for accessing documents returned by the Terminus DB API programmatically
     *
     * @example
     * let doc = new TerminusDocument(client);
     *
     * //These set the objects document property and return promises:
     *
     * doc.loadDocument(URL).then(() => console.log(this.document));
     * doc.loadComplete(URL, CLS).then(() => console.log(this.document))
     * doc.loadSchema(cls).then(() => console.log(this.document))
     *
     * //These just set the object's document property
     * doc.loadJSON(json_frames, cls) //console.log(this.document)
     * doc.loadDataFrames(json_frames, cls)
     * doc.loadClassFrames(json_frames, cls)
     * @example
     *
     * @description Represents a frame for programmatic access to object frame, anywhere within a document
     * Recursive data structure where this.children contains an indexed array of object frames
     * and this.dataframes contains a property indexed array of data frames
     * Every object frame carries a reference to its classframe
     * This gives us instructions as to how to create new frames according to the schema
     * After that it's turtles all the way down.
     * @param cls - ID of the class (URL)
     * @param classframe - an array of frames representing a class
     * @param archetypes list of class frames
     * @param parent parent object
     * @returns
     */
    constructor(cls: any, jsonld: any, classframes: any, parent: any);
    cls: any;
    originalDocument: any;
    parent: any;
    newDoc: boolean;
    loadClassFrames(classframes: any): ObjectFrame;
    jsonld_context: any;
    classframes: {};
    hasSchema(): boolean;
    loadJSONLDDocument(doc: any): ObjectFrame;
    subjid: any;
    getAsFrame(prop: any, parent: any): any;
    getAsFrames(prop: any, parent: any): any[];
    empty(): void;
    properties: {};
    restrictions: {};
    reset(prop: any): void;
    clear(): ObjectFrame;
    mfilter(rules: any, onmatch: any): ObjectFrame;
    getPropertyClassFrame(prop: any, jsonlddoc: any): any;
    getProperties(type: any): any[];
    getMissingPropertyList(): {
        label: any;
        value: any;
    }[];
    getFilledPropertyList(): {
        label: any;
        value: any;
    }[];
    fillFromSchema(newid: any): ObjectFrame;
    originalFrames: any[];
    clone(newid: any): ObjectFrame;
    getChild(childid: any, prop: any): any;
    addProperty(prop: any, cls: any): false | PropertyFrame;
    addPropertyValue(prop: any, value: any): any;
    removeProperty(prop: any): void;
    removePropertyValue(prop: any, value: any, index: any): void;
    error(msg: any): void;
    errors: any[];
    extract(): any;
    extractJSONLD(extracts: any): any;
    subject(): any;
    get: any;
    set(val: any): void;
    isObject(): boolean;
    isProperty(): boolean;
    isData(): boolean;
    subjectClass(): any;
    depth(): any;
    getProperty(prop: any): any;
    first(prop: any): any;
    property(prop: any): any;
    parentObject(): any;
    root(): boolean;
    renderProperties(): any[];
    sortProperties(): string[];
    standardCompare(a: any, b: any, doc: any): 1 | -1 | 0;
    cardControlAllows(action: any): boolean;
    isUpdated(): boolean;
    isNew(): boolean;
    getSummary(): {
        status: string;
    };
    getLabel: any;
    getComment: any;
}
declare function PropertyFrame(property: any, cframe: any, parent: any): void;
declare class PropertyFrame {
    constructor(property: any, cframe: any, parent: any);
    predicate: any;
    cframe: any;
    parent: any;
    values: any[];
    addJSONLDDocument(jsonld: any): void;
    addFrame(frame: any): void;
    addValueFrame(oframe: any): void;
    fillFromSchema(newid: any): void;
    isData(): any;
    isObject(): any;
    isProperty(): boolean;
    property(): any;
    extract(): any[];
    subject(): any;
    subjectClass(): any;
    depth(): any;
    updated(): any;
    range(): any;
    getLabel(): any;
    getComment(): any;
    hasCardinalityRestriction(): any;
    getRestriction(): any;
    isClassChoice(): any;
    deletePropertyValue(value: any, index: any): void;
    removeValue(value: any, index: any): void;
    get(): any[];
    set(val: any): void;
    clear(): void;
    clone(): PropertyFrame;
    getAsFrames(): any[];
    createEmpty(): any;
    mfilter(rules: any, onmatch: any): PropertyFrame;
    first(): any;
    renderValues(): any[];
    sortValues(): any[];
    cardControlAllows(action: any): boolean;
    isUpdated(): boolean;
}
