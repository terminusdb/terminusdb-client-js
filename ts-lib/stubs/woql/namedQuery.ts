import { WoqlConfig } from "../../types";
import { WoqlBaseSegment, WoqlNamedQuery } from "../WoqlObjectTypes";

export const namedQuery = (
  name: string,
  woql: WoqlBaseSegment,
  config?: WoqlConfig
): WoqlNamedQuery => {
  return {
    "@id": config?.id,
    "@type": "NamedQuery",
    name,
    query: woql,
    renderLegacyWoql: () => woql.renderLegacyWoql()
  };
};
