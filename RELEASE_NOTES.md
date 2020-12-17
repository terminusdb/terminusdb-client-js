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


