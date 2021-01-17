export = FrameRule;
/**
 * @file Frame Rule
 * @license Apache Version 2
 */
declare function FrameRule(): void;
declare class FrameRule {
    pattern: FramePattern;
    constructor: typeof TerminusRule.TerminusRule;
    testRules(rules: [FrameRule], frame: any, onmatch?: Function): import("./frameRule.js")[];
    patternMatchesFrame(pattern: any, frame: any): any;
    property(...prop: any[]): any;
    frame_type(...frame_type: any[]): any;
    label(...prop: any[]): any;
    subject(...prop: any[]): any;
    subjectClass(...prop: any[]): any;
    range(...prop: any[]): any;
    value(...prop: any[]): any;
    depth(depth: any): any;
    index(...index: any[]): any;
    status(...status: any[]): any;
    parent(par: any): any;
    children(...children: any[]): any[] | FrameRule;
}
declare namespace FrameRule {
    export { FramePattern };
}
/**
 * @file Frame Pattern
 * A frame pattern can have the following variables
 * scope : object, property, data, * - matches a specific part of the frame
 * label : matches the label of a property
 * frame_type: object, data, document, id, oneOf
 * subject: id of the subject
 * subjectClass: class of the subject
 * range: type of a property (applies to property and data)
 * property: property id or list of property ids (parent property if it is an object or data)
 * value: value of the property
 * parent: a pattern relating to the parent of this frame
 * children: patterns for matching on the children of a frame
 * depth: how deep are we in the document? starts from 0
 * index: the index of a value in an array
 * status: updated, error, new, ok,
 */
declare function FramePattern(): void;
declare class FramePattern {
    constructor: typeof TerminusRule.TerminusPattern;
    setPattern(pattern: any): void;
    scope: any;
    literal: any;
    type: any;
    label: any;
    frame_type: any;
    subject: any;
    subjectClass: any;
    range: any;
    property: any;
    value: any;
    parent: any;
    children: any[];
    depth: any;
    index: any;
    status: any;
    json(): {
        literal: any;
        type: any;
        scope: any;
        value: any;
        label: any;
        frame_type: any;
        subject: any;
        subjectClass: any;
        range: any;
        property: any;
        parent: any;
        children: any[];
        depth: any;
        index: any;
        status: any;
    };
    checkFrame(frame: any): boolean;
    prettyPrint(type: any): string;
    illegalRuleType(rtype: any): boolean;
    checkSubject(subject: any, frame: any): boolean;
    checkChildren(rtype: any, frame: any): boolean;
    checkStatus(rtype: any, frame: any): boolean;
    checkDepth(rtype: any, frame: any): any;
    checkParent(rtype: any, frame: any): any;
    checkIndex(rtype: any, frame: any): boolean;
    checkProperty(rtype: any, frame: any): boolean;
    checkType(rtype: any, frame: any): boolean;
    checkLiteral(rtype: any, frame: any): any;
    checkValue(rtype: any, frame: any): boolean;
    checkRange(rtype: any, frame: any): boolean;
    checkSubjectClass(rtype: any, frame: any): boolean;
    checkFrameType(rtype: any, frame: any): boolean;
    checkLabel(rtype: any, frame: any): boolean;
    getRendererType(frame: any): any;
}
import TerminusRule = require("./terminusRule.js");
