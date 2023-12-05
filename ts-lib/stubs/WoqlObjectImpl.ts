import { WoqlConfig } from "../types";
import {
  // WoqlInterface,
  WoqlNodeValueExpression,
} from "./WoqlObjectTypes";
import * as woql from "./woql";

export const convertToWoqlValueTerm = (term: string): WoqlNodeValueExpression => {
  return {
    "@type": "NodeValue",
    variable: term,
    renderLegacyWoql: () => term
  };
};

export interface NamedParametricQueryConfiguration extends WoqlConfig {
  bindParameters?: Array<string>;
}

export const WoqlAst = woql;
