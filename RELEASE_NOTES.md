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


