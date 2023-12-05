export type TerminusPropertySingle = string | number | boolean | TerminusResponseObject;
export type TerminusPropertyValue = TerminusPropertySingle | Array<TerminusPropertySingle> | Record<string, unknown> | object | Array<object>;
export type TerminusResponseObject = null | TerminusReadObject;

export interface WoqlConfig {
  id?: string;
}

export interface TerminusReadObject {
  "@id"?: string;
  "@type": string;
  [propName: string]: TerminusPropertyValue | undefined;
}

export interface TerminusReadObjectWithId {
  "@id": string;
  "@type": string;
  [propName: string]: TerminusPropertyValue | undefined;
}

export interface WoqlObject extends TerminusReadObject {
  "@type": "And" | "Triple";
}

export interface WoqlParameter {
  key: string,
  value: string,
}