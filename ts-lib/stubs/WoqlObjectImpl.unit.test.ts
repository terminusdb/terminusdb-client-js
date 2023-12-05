import WOQL from "../../lib/woql";
import { WoqlAst } from "./WoqlObjectImpl";

describe("Ensure sanity checks for WOQL functionality for VisualWoql implementation", () => {
  it("should render a JSON object from a simple query with and and triples", () => {
    const woqlAst = WoqlAst.and([WoqlAst.triple("s", "p", "o"), WoqlAst.triple("s", "p", "o")]);
    const rendered = woqlAst.renderLegacyWoql().json();
    const woqlRendered = WOQL.and(WOQL.triple("s", "p", "o"), WOQL.triple("s", "p", "o")).json();
    expect(rendered).toStrictEqual(woqlRendered);
  });

  it("should render a JSON object from a simple query with variables", () => {
    const woqlAst = WoqlAst.and([WoqlAst.triple("v:s", "v:p", "v:o"), WoqlAst.triple("v:s", "v:p", "v:o")]);
    const rendered = woqlAst.renderLegacyWoql().json();
    const woqlRendered = WOQL.and(WOQL.triple("v:s", "v:p", "v:o"), WOQL.triple("v:s", "v:p", "v:o")).json();
    expect(rendered).toStrictEqual(woqlRendered);
  });

  it("should render a named query from the AST", () => {
    const woqlAst = WoqlAst.namedQuery("", WoqlAst.triple("v:s", "v:p", "v:o"));
    const rendered = woqlAst.renderLegacyWoql().json();
    const woqlRendered = WOQL.triple("v:s", "v:p", "v:o").json();
    expect(rendered).toStrictEqual(woqlRendered);
  });

  it("should render a named parametric query from the AST", () => {
    const woqlAst = WoqlAst.namedParametricQuery("", WoqlAst.triple("v:s", "v:p", "v:o"), {
      bindParameters: ["v:myVar"],
    });
    const rendered = woqlAst.renderBoundLegacyWoql("variableValue").json();
    const woqlRendered = WOQL.and(WOQL.eq("v:myVar", "variableValue"), WOQL.triple("v:s", "v:p", "v:o")).json();
    expect(rendered).toStrictEqual(woqlRendered);
  });

  it("should render a named parametric query from the AST", () => {});
});
