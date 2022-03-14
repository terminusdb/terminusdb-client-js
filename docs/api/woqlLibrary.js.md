
# WOQLLibrary
## WOQLLibrary
**License**: Apache Version 2  

## new WOQLLibrary()
Library Functions to manage the commits graph

**Example**  
```javascript
const woqlLib = WOQLLibrary()
 woqlLib.branches()

 //or you can call this functions using WOQL Class
 WOQL.lib().branches()
```

## branches
##### woqlLibrary.branches()
General Pattern 4: Retrieves Branches, Their ID, Head Commit ID, Head Commit Time
(if present, new branches have no commits)


## commits
##### woqlLibrary.commits([branch], [limit], [start], [timestamp])
get all the commits of a specific branch
if a timestamp is given, gets all the commits before the specified timestamp


| Param | Type | Description |
| --- | --- | --- |
| [branch] | <code>string</code> | the branch name |
| [limit] | <code>number</code> | the max number of result |
| [start] | <code>number</code> | the start of the pagination |
| [timestamp] | <code>number</code> | Unix timestamp in seconds |


## previousCommits
##### woqlLibrary.previousCommits([commit_id], [limit])
get commits older than the specified commit id


| Param | Type | Description |
| --- | --- | --- |
| [commit_id] | <code>string</code> | the commit id |
| [limit] | <code>number</code> | the max number of result |


## first_commit
##### woqlLibrary.first\_commit()
Finds the id of the very first commit in a database's history

This is useful for finding information about when, by who and why the database was created
The first commit is the only commit in the database that does not have a parent commit

