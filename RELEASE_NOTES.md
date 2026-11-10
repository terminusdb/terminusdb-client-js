# TerminusDB Client v12.1.0
## Breaking
* Remove the `lib/viewer` rendering layer deprecated in 12.0.9 — `View`, `WOQLResult`, `WOQLTable`, `WOQLGraph` and their rule/config helpers are no longer exported. Data rendering is outside this package's scope; render query results with your own components.
* Remove the public `axiosInstance` export together with the `axios` dependency — the HTTP layer now runs on native `fetch` (Node ≥20 and all modern browsers)

## Fixes and maintenance
* Replace `axios` with native `fetch`; multipart uploads use native `FormData`/`Blob` and request gzip uses `CompressionStream` in both Node and browser — the client now ships **zero runtime dependencies** (drops `axios`, `form-data`, `buffer`, `pako`)
* The undocumented self-signed-certificate bypass for `https://127.0.0.1` is removed — Node now enforces normal TLS verification on loopback HTTPS. To develop against a local HTTPS server with a self-signed certificate, set `NODE_TLS_REJECT_UNAUTHORIZED=0` explicitly in your environment
* Remove unused dependencies and redundant security pins (`webpack-dev-server`, `ts-node`, `concurrently`, `node-forge`, `eol`, `follow-redirects`, `pathval`, `underscore`, `html-webpack-plugin`, `prettier`, `jsdoc-to-markdown`) and the dead `mkdocs:*` scripts and `jest.config.ts` → `jest.config.js`
* Publish to npm via trusted publishing (OIDC) with provenance attestation

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

# TerminusDB Client v12.0.1
## New 🚀
* Add WOQL predicates:
  * `set_difference` (operates on a set, takes lists)
  * `set_intersection` (operates on a set, takes lists)
  * `set_union` (operates on a set, takes lists)
  * `set_member` (operates on a set, takes set, prepare with list_to_set)
  * `list_to_set` (converts a list to a set)

## Fixes and maintenance
* bump latest packages with security fixes

# TerminusDB Client v12.0.0
## New 🚀
* Add WOQL `slice()`, and `idgen_random()` operators

## Fixes and maintenance
* Update with latest security fixes
* Follow latest release of TerminusDB v12.0.0
* Make `dot()` operator work correctly again
* Fix handling of list-nested WOQL document templates (#346)
* Make VarUnique process correctly

# TerminusDB Client v11.1.2
## Fixes
* Adjust the release process to include version update task
* Fix typescript generation and add ci tests to prevent similar errors in the future.

# TerminusDB Client v11.1.1
## Fixes
* Update dependencies follow-redirects, webpack-dev-middleware, axios, braces, semver, micromatch, cross-spawn, word-wrap, on-headers, compression, form-data
* Fixes axios upgrade issues, incl. content-type casing error, buffer
* Fixes inconsistency with removed_quad keyword (DeleteQuad in WOQL)
* Fluent vs functional style inconsistency with from() fixed
* Clean up code and improve test suites
* Documentation fixes and updates
* Fix variable name mismatches in from() and length() methods
* Verified xsd:double handled correctly in conjunction with terminusdb server

## New 🚀
* Enable string-based CSV resources (not only from local files)
* Increased test coverage from 30% to 59%
* Deprecated Node 18, lowest supported is now Node 20
* Handling of remotes is now supported in the client
* New: `vars_unique()` produces unique variables, complement to `vars()`
* Add evaluate() to fluent style WOQL queries

# TerminusDB Client v10.0.33
## Fixes
* Update dependencies word-wrap, semver, axios
* Fix arithmetic variable treatment (#296)
* Marshall variable args carefully in arithmetic expressions (#297)

# TerminusDB Client v10.0.32
## Fixes 🛠
* Make AccessControl manageCapability scopeType param optional

# TerminusDB Client v10.0.30
## Fixes 🛠
* Fix schema endpoint for system database

# TerminusDB Client v10.0.30
## Fixes 🛠
* Fix DiffObject type definition

# TerminusDB Client v10.0.29
## Fixes 🛠
* Fix getCommitsLog in WOQLClient

## New 🚀
* add pagination to getVersionDiff
* add getDocumentHistory in WOQLClient class
* add baseServer property to ConnectionConfig class 

# TerminusDB Client v10.0.28

## Fixes 🛠
* Fix woql.distinct using variables
* Fix woql.select using variables

# TerminusDB Client v10.0.27

## Fixes 🛠
* Fix woql.group_by using variables
* Fix woql.order_by using variables
* Fix typescript types

## New 🚀
* add patchResource in WOQLClient class

# TerminusDB Client v10.0.26

## Fixes 🛠
* Fix woqlPrinter
* Fix woqlClient updateDatabase

## New 🚀
* add getCommitsLog in WOQLClient class
# TerminusDB Client v10.0.25

## Fixes 🛠

* Fix woqlPrinter

# TerminusDB Client v10.0.24

## Fixes 🛠

* Review WOQL typescript definitions

# TerminusDB Client v10.0.22

## New 🚀

* Add Woql.boolean in WOQL class
* Add Woql.date in WOQL class
* Add Woql.datetime in WOQL class

# TerminusDB Client v10.0.21

## New 🚀

* Add getOrganizationRemote in AccessControl class

## Fixes 🛠

* Replace coveralls with coveralls-next

# TerminusDB Client v10.0.19

## New 🚀

* Add getOrganization in AccessControl class
* Add hasDatabase head api call in WOQL-Client
* Add Woql.Vars in WOQL class

## Fixes 🛠

* Remove core-js@2
* Documentation fixes
* Fix update_triple in woql
* Fix types declaration

# TerminusDB Client v10.0.12

## New 🚀

* Add the ability to add additional diff options to the diff endpoint

# TerminusDB Client v10.0.11

## New 🚀

* Generating type definitions for typescript by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/185
* Added create query parameter for update document by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/189

## Fixes 🛠

* Fixed woql start by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/184
* Fixed bug in WOQL.doc not encoding lists by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/191
* Fixed woql docs by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/194

## Deprecated ☠️

* Deprecated query document by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/187

<br/><br/>

# TerminusDB Client v10.0.10

## New 🚀

* Add support for variables in woql.doc by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/181

## Fixes 🛠

* Fix the way of sending tokens to the cloud api by @GavinMendelGleason in https://github.com/terminusdb/terminusdb-client-js/pull/182
* Upgrade async library to prevent prototype pollution

---

# TerminusDB Client v10.0.9

## New 🚀

* Add diff endpoint by @GavinMendelGleason in https://github.com/terminusdb/terminusdb-client-js/pull/178

---

# TerminusDB Client v10.0.8

## New 🚀

* Add gzip compression by @rrooij in https://github.com/terminusdb/terminusdb-client-js/pull/167

---

# TerminusDB Client v10.0.7

## New 🚀

* Add getPrefixes by @Francesca-Bit in https://github.com/terminusdb/terminusdb-client-js/pull/152
* Added examples for dataVersion docs by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/147

## Fixes 🛠

* Fixed WOQL.as and WOQL.path docs by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/140
* Fixed woql.post query having multiple files with woql.and by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/160
* Fixed cleanObject output for @value = 0 by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/163
* Update accessControl by @Francesca-Bit in https://github.com/terminusdb/terminusdb-client-js/pull/144
* Converted string variables to woql variables "Var" in documentation by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/141

---

# TerminusDB Client v10.0.6

## New 🚀

* Allow infinite size of body and content by @rrooij in https://github.com/terminusdb/terminusdb-client-js/pull/129
* Improving installation steps for the js package by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/125
* Update createDocs.js by @mark-terminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/130
* Use eol.lf with jsdoc-to-markdown, improve CI workflow by @spl in https://github.com/terminusdb/terminusdb-client-js/pull/133

## Fixes 🛠

* Fixed WOQL.post function by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/118
* Fix linting by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/112
* Fixes update_triple variable name bug by @Neelterminusdb in https://github.com/terminusdb/terminusdb-client-js/pull/131

---

# TerminusDB Client v10.0.5

## New 🚀

* Add new [getDatabases](https://terminusdb.github.io/terminusdb-client-js/#/api/woqlClient.js?id=getdatabases) method [#121](/../../pull/121)
* Add track version id [#116](/../../pull/116)

## Fixes 🛠

* Fixed tests [#123](/../../pull/123)
* Modified AccessControl documentations, added api token [#124](/../../pull/124)
* UPDATED packages [#126](/../../pull/126)

## Deprecated ☠️

* Deprecated connect function [#114](/../../pull/114)

---

# TerminusDB Client v10.0.4

## New 🚀

* Added AccessControl class
* Added diff and patch functions in WOQL.client

## Fixes 🛠

* Fixed create new branch documentation [#105](/../../issues/105)

---

# TerminusDB Client v10.0.3

## New 🚀

* Added support for new API authentication with TerminusX

## Fixes 🛠

* Fixed optimizeBranch() ([#92](/../../issues/92))
* Fixed encoding URL in client 
* Added custom User-Agent header
* Fixed https package not found ([#97](/../../issues/97)) by adding browser setting in package.json
* Fixed replaceAll is not a function error ([#95](/../../issues/95))

--- 

# TerminusDB Client v10.0.2

## new 🚀

* Added support for multi organizations
* Add client.getUserOrganizations 
* Add client.userOrganizations (Retrieves a list of databases)
* Added *read_document, insert_document, update_document, delete_document* functions for modification of documents using WOQL 
* Add dot() in WOQL query

## fixes 🛠

* fixed order_by in WOQL ([#35](/../../issues/35))
* fixed auto generation of docs ([#62](/../../issues/35))
* removed unused dependencies

## deprecated ☠️

* removed read_object

--- 

# TerminusDB Client v10.0.1

## new

* Add read_object 
* Add utf-8 support

## fixes

* fixed woql query for commits

--- 

# TerminusDB Client v10.0.0

## new

* Added functionalties to support new document interface
* Added new functions to support TerminusX

--- 

# TerminusDB Client v4.1.0

## new

+ Enhancements to graph view and document view

# TerminusDB Client v4.0.0

## new

* add update_quad
* add update_triple
* add woql word once
* add context to using
* add type_of
* better error reporting
* add csv uploading

## fixes

* Fix group_by

# TerminusDB Client v3.0.3

The liberation release 

## new

* Upgrade dependencies
* Path predicate directions
* Add switch for forcing db deletes

## fixes

* Fix length and predicate pattern compilation
* Fix bug with non-text nodes

# TerminusDB Client v3.0.0

The liberation release 

## new

support for including prefixes
full support for Terminus Server Collaboration API

# TerminusDB Client v2.0.9 Release Notes

## new

Ability to set no commit as starting point for a new branch in client branch api 

Functions for more convenient navigation of the commit graph 
* lib().commit_history()
* lib().commit_future()
* lib().commit_timeline()
* lib().next_commits()
* lib().previous_commits()
* lib().active_commit()

## bug-fixes

Fixed automatic type detection to recognise terminusdb:/// iris

# TerminusDB Client v2.0.8 Release Notes

## new

Ability to set default branch id in connection configuration init 
WOQL.all()
WOQL.vars()
WOQL.nuke()

Promoted stable parts of WOQL.schema() and WOQL.lib() to fully fledged WOQLQuery status to enable chaining

## bug-fixes

Removed extraneous ` from nonNegativeInteger datatype
Removed export of all internal objects

# TerminusDB Client v2.0.7 Release Notes

## new

New Fetch API Call

## bug fixes

Fixed bug in WOQL.order_by to make descending work

# TerminusDB Client v2.0.6 Release Notes

## new

Added support for remote database status resolution to connection capabilities
Added new databases() api support
Added global assets_overview query
Added new general time travel function - getCommitAtTime()

## bug fixes

Fixed bug with idgen 

# TerminusDB Client v2.0.5 Release Notes

## bug fixes

+ Fixed PUT
+ Some other fixes as well

# TerminusDB Client v2.0.4 Release Notes

## new

Added tests for inferred use of ands

## bug fixes

Fixed remaining bugs in cardinality functions
Fixed bugs in PUT JSON-LD generation
Fixed tests for chaining and cardinality functions


# TerminusDB Client v2.0.3 Release Notes

## New
* First release of the WOQL standard library - available via WOQL.lib().LIBRARY_FUNCTION()
* Added working versions of clone, pull, push, fetch to API
* Added support for basic auth to remote servers

## Bug fixes

Fixed bugs in cardinality operators in WOQL (max, min, card - all now work properly)

Tidied up triplebuilder by eliminating no longer need object.

Fixed transmission of prefixes over API


