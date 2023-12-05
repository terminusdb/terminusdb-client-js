import { WoqlConfig } from "../../types";
import WOQL from "../../../lib/woql";
import {
  WoqlAnd,
  WoqlBaseSegment
} from "../WoqlObjectTypes";

export const and = (and: Array<WoqlBaseSegment>, config?: WoqlConfig): WoqlAnd => {
  return {
    ...(config?.id ? { "@id": `And/${config?.id}` } : {}),
    "@type": "And",
    and,
    renderLegacyWoql: () => WOQL.and(...and.map(andSegment => andSegment.renderLegacyWoql()))
  };
};
