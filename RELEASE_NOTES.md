# TerminusDB Client v2.0.6 Release Notes

## new

Added support for remote database status resolution to connection capabilities
Added new databases() api support
Added global assets_overview query
Added new general time travel function - getCommitAtTime()

## bug fixes

Fixed bug with idgen 
Fixed bug with put

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


