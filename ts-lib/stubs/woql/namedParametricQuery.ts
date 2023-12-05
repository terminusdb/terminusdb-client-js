import WOQL from "../../../lib/woql";
import { WoqlBaseSegment, WoqlNamedParametricQuery } from "../WoqlObjectTypes";
import { NamedParametricQueryConfiguration } from "../WoqlObjectImpl";

export const namedParametricQuery = (
  name: string,
  woql: WoqlBaseSegment,
  config?: NamedParametricQueryConfiguration
): WoqlNamedParametricQuery => {
  const parameters = config?.bindParameters ?? [];
  return {
    "@id": config?.id,
    "@type": "NamedParametricQuery",
    name,
    query: woql,
    parameters: parameters,
    // When you need to use it outside of TerminusDB, remember to bind the parameter to the positional values!
    renderLegacyWoql: () => woql.renderLegacyWoql(),
    renderBoundLegacyWoql: (...args: Array<string>) => {
      if (args.length !== parameters.length) {
        throw new Error(
          "The number of arguments must match the number of parameters"
        );
      }
      return WOQL.and(
        ...args.map((arg, index) => WOQL.eq(parameters[index], arg)),
        woql.renderLegacyWoql()
      );
    }
  };
};
