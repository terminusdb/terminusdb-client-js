import { WoqlConfig } from "../../types";
import WOQL from "../../../lib/woql";
import {
  WoqlNodeValueExpression,
  WoqlTriple
} from "../WoqlObjectTypes";
import { convertToWoqlValueTerm } from "../WoqlObjectImpl";

export const triple = (
  subject: string | WoqlNodeValueExpression,
  predicate: string | WoqlNodeValueExpression,
  object: string | WoqlNodeValueExpression,
  config?: WoqlConfig
): WoqlTriple => {
  return {
    ...(config?.id ? { "@id": `Triple/${config?.id}` } : {}),
    "@type": "Triple",
    subject: typeof subject === "string" ? convertToWoqlValueTerm(subject) : subject,
    predicate: typeof predicate === "string"
      ? convertToWoqlValueTerm(predicate)
      : predicate,
    object: typeof object === "string" ? convertToWoqlValueTerm(object) : object,
    renderLegacyWoql: () => WOQL.triple(
      typeof subject === "string" ? subject : subject.renderLegacyWoql(),
      typeof predicate === "string"
        ? predicate
        : predicate.renderLegacyWoql(),
      typeof object === "string" ? object : object.renderLegacyWoql()
    )
  };
};
