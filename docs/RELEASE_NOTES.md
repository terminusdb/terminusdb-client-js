# TerminusDB Client v12.0.9

This release aligns the client with TerminusDB 12.1, overhauls the TypeScript typings with generic `WOQLClient` result types and catchable 404s, and adds new WOQL predicates: `triple_relation` for Allen interval queries and `idgen_uuid_v7` with `UuidV7` key support. The legacy `lib/viewer` rendering layer is deprecated and its `eval()` usage removed. Dependencies are refreshed across the board.

## New functionality

* Add upsert and `merge_repeats` behaviour to the client [#379](https://github.com/terminusdb/terminusdb-client-js/pull/379)
* Add `unfold` option to the diff endpoint [#388](https://github.com/terminusdb/terminusdb-client-js/pull/388)
* Add `WOQL.idgen_uuid_v7` and `UuidV7` key support [#389](https://github.com/terminusdb/terminusdb-client-js/pull/389)
* Add `WOQL.triple_relation` for Allen interval queries [#392](https://github.com/terminusdb/terminusdb-client-js/pull/392)
* TypeScript typing overhaul: `Var` acceptance in WOQL (#378), generic `WOQLClient` results (#382), catchable 404s (#238) [#420](https://github.com/terminusdb/terminusdb-client-js/pull/420)
* Generic `WOQLClient` result types and shared typedefs (#382) [#421](https://github.com/terminusdb/terminusdb-client-js/pull/421)

## Behavior changes

* Send `TerminusDB-Data-Version` per request instead of persisting it (closes #391) [#419](https://github.com/terminusdb/terminusdb-client-js/pull/419)
* Deprecate the `lib/viewer` rendering layer and remove `eval()` usage [#422](https://github.com/terminusdb/terminusdb-client-js/pull/422)

## Bugfixes

* Initial fix for the vars issue (#378) [#381](https://github.com/terminusdb/terminusdb-client-js/pull/381)
* Specify `DateDuration` integration test literals as `xsd:dateTime` in UTC so duration semantics are unambiguous [#393](https://github.com/terminusdb/terminusdb-client-js/pull/393)
* Client 12.1 alignment fixups [#398](https://github.com/terminusdb/terminusdb-client-js/pull/398)

## Maintenance

* Improve jsdocs [#380](https://github.com/terminusdb/terminusdb-client-js/pull/380)
* Use the approved short description for npm [#390](https://github.com/terminusdb/terminusdb-client-js/pull/390)
* Move CI and tooling to Node 22 [#418](https://github.com/terminusdb/terminusdb-client-js/pull/418)
* Bump flatted from 3.2.7 to 3.4.2 [#372](https://github.com/terminusdb/terminusdb-client-js/pull/372)
* Bump picomatch from 2.3.1 to 2.3.2 [#373](https://github.com/terminusdb/terminusdb-client-js/pull/373)
* Bump handlebars from 4.7.7 to 4.7.9 [#374](https://github.com/terminusdb/terminusdb-client-js/pull/374)
* Bump follow-redirects from 1.15.11 to 1.16.0 [#377](https://github.com/terminusdb/terminusdb-client-js/pull/377)
* Bump lodash from 4.17.23 to 4.18.1 [#375](https://github.com/terminusdb/terminusdb-client-js/pull/375)
* Bump axios from 1.13.5 to 1.15.2 [#383](https://github.com/terminusdb/terminusdb-client-js/pull/383)
* Bump fast-uri from 3.0.6 to 3.1.2 [#384](https://github.com/terminusdb/terminusdb-client-js/pull/384)
* Bump @babel/plugin-transform-modules-systemjs from 7.19.0 to 7.29.8 [#385](https://github.com/terminusdb/terminusdb-client-js/pull/385)
* Bump axios from 1.15.2 to 1.20.0 [#397](https://github.com/terminusdb/terminusdb-client-js/pull/397)
* Bump shell-quote from 1.8.3 to 1.12.0 [#402](https://github.com/terminusdb/terminusdb-client-js/pull/402)
* Bump webpack-dev-server from 5.2.1 to 5.2.6 [#386](https://github.com/terminusdb/terminusdb-client-js/pull/386)
* Bump websocket-driver from 0.7.4 to 0.7.5 [#403](https://github.com/terminusdb/terminusdb-client-js/pull/403)
* Bump handlebars from 4.7.9 to 4.7.10 [#400](https://github.com/terminusdb/terminusdb-client-js/pull/400)
* Bump proxy-addr from 2.0.7 to 2.0.8 [#404](https://github.com/terminusdb/terminusdb-client-js/pull/404)
* Bump node-forge from 1.3.2 to 1.4.3 [#394](https://github.com/terminusdb/terminusdb-client-js/pull/394)
* Bump ws from 8.18.0 to 8.22.2 [#410](https://github.com/terminusdb/terminusdb-client-js/pull/410)
* Bump fast-uri from 3.1.2 to 3.1.9 [#399](https://github.com/terminusdb/terminusdb-client-js/pull/399)
* Bump brace-expansion from 1.1.12 to 1.1.21 [#405](https://github.com/terminusdb/terminusdb-client-js/pull/405)
* Bump js-yaml from 4.1.1 to 4.3.2 [#406](https://github.com/terminusdb/terminusdb-client-js/pull/406)
* Bump browserslist from 4.28.1 to 4.29.5 [#408](https://github.com/terminusdb/terminusdb-client-js/pull/408)
* Bump compression from 1.8.1 to 1.8.2 [#411](https://github.com/terminusdb/terminusdb-client-js/pull/411)
* Bump markdown-it and jsdoc [#407](https://github.com/terminusdb/terminusdb-client-js/pull/407)
* Bump lodash.omit from 4.5.0 to 4.18.0 [#395](https://github.com/terminusdb/terminusdb-client-js/pull/395)
* Bump webpack-dev-middleware from 7.4.2 to 7.4.6 [#414](https://github.com/terminusdb/terminusdb-client-js/pull/414)
* Bump http-proxy-middleware from 2.0.9 to 2.0.11 [#415](https://github.com/terminusdb/terminusdb-client-js/pull/415)
* Bump @babel/core from 7.19.3 to 7.29.13 [#416](https://github.com/terminusdb/terminusdb-client-js/pull/416)
* Bump qs and express [#412](https://github.com/terminusdb/terminusdb-client-js/pull/412)
* Bump follow-redirects from 1.16.0 to 1.16.3 [#396](https://github.com/terminusdb/terminusdb-client-js/pull/396)
* Bump serialize-javascript, terser-webpack-plugin and mocha [#413](https://github.com/terminusdb/terminusdb-client-js/pull/413)
* Bump uuid, nyc and webpack-dev-server [#417](https://github.com/terminusdb/terminusdb-client-js/pull/417)

## Security

* Remove `eval()` usage by deprecating the `lib/viewer` rendering layer [#422](https://github.com/terminusdb/terminusdb-client-js/pull/422)
* Dependency security refresh across axios, handlebars, lodash, node-forge, ws, brace-expansion, serialize-javascript and related packages (see Maintenance for the full list)

**Full Changelog**: https://github.com/terminusdb/terminusdb-client-js/compare/v12.0.5...v12.0.9
