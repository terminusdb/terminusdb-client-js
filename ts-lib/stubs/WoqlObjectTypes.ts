import { WoqlConfig } from "../types";
import { NamedParametricQueryConfiguration } from "./WoqlObjectImpl";

export type WoqlTerm = "NamedParametricQuery" | "NamedQuery" | "And" | "Select" | "Triple";
export type WoqlQueryTerm = WoqlBaseSegment;

export interface WoqlBaseSegment {
  "@id"?: string;
  "@type": unknown;
  renderLegacyWoql: () => LegacyWoql;
}

// FIXME: The legacy WOQL is of type any...
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LegacyWoql = any;

export interface WoqlValueSegment {
  "@id"?: string;
  "@type": unknown;
}

export interface WoqlNodeValueVariable extends WoqlNodeValueTemplate {
  "@type": "NodeValue";
  variable: string;
}

export interface WoqlNodeValueNode extends WoqlNodeValueTemplate {
  "@type": "NodeValue";
  node: string;
}

export type WoqlNodeValueExpression = WoqlNodeValueNode | WoqlNodeValueVariable;

// type WoqlNodeValueKeys = "variable" | "node"

export interface WoqlNodeValueTemplate extends WoqlValueSegment {
  // FIXME: Needs to be checked, and inserted before submitting, perhaps in the future, accepted on the server side
  parameterIndex?: number;
  renderLegacyWoql: () => LegacyWoql;
}

export interface WoqlAnd extends WoqlBaseSegment {
  "@type": "And";
  and: Array<WoqlBaseSegment>;
}

export interface WoqlSelect extends WoqlBaseSegment {
  "@type": "Select";
}

export interface WoqlTriple extends WoqlBaseSegment {
  "@type": "Triple";
  subject: WoqlNodeValueExpression;
  predicate: WoqlNodeValueExpression;
  object: WoqlNodeValueExpression;
}

export interface WoqlNamedParametricQuery extends WoqlBaseSegment {
  "@type": "NamedParametricQuery";
  name: string;
  query: WoqlQueryTerm;
  parameters: Array<string>;
  renderBoundLegacyWoql: (...args: Array<string>) => LegacyWoql;
}

export interface WoqlNamedQuery extends WoqlBaseSegment {
  "@type": "NamedQuery";
  name: string;
  query: WoqlQueryTerm;
}
