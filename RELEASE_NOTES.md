# TerminusDB Client v2.0.3 Release Notes

## New
* First release of the WOQL standard library - available via WOQL.lib().LIBRARY_FUNCTION()
* Added working versions of clone, pull, push, fetch to API
* Added support for basic auth to remote servers

## Bug fixes

Fixed bugs in cardinality operators in WOQL (max, min, card - all now work properly)

Tidied up triplebuilder by eliminating no longer need object.

Fixed transmission of prefixes over API


