////@ts-check
const WOQLQuery = require('./woqlCore')

/**
 *  Library Functions
 **/
function WOQLLibrary() {
    this.default_schema_resource = 'schema/main'
    this.default_commit_resource = '_commits'
    this.default_meta_resource = '_meta'
    this.masterdb_resource = '_system'
    this.empty = ''
}

/**
 * General Pattern 4: Retrieves Branches, Their ID, Head Commit ID, Head Commit Time
 * (if present, new branches have no commits)
 */
WOQLLibrary.prototype.branches = function(){//values, variables, cresource) {
    const woql = new WOQLQuery().using("_commits").triple("v:Branch","rdf:type","@schema:Branch").
                triple("v:Branch","@schema:name","v:Name").
                opt().triple("v:Branch","@schema:head","v:Head").
                triple("v:Head","@schema:identifier","v:commit_identifier").          
                triple("v:Head","@schema:timestamp","v:Timestamp")  
    return woql
}

/**
 * get all the commits of a specific branch
 * if a timestamp is given, gets all the commits before the specified timestamp
 * @param {string} branch - the branch name
 * @param {number} limit - the max number of result
 * @param {number} timestamp - Unix timestamp in seconds
 */

WOQLLibrary.prototype.commits = function (branch="main",limit=10,timestamp=0){
    const  woql = new WOQLQuery().using("_commits").limit(limit)
                    .select("v:Parent ID","v:Commit ID","v:Time","v:Author", "v:Branch ID","v:Message")
    
    const andArr= [ new WOQLQuery().triple("v:Branch", "name", new WOQLQuery().string(branch))
                    .triple("v:Branch", "head", "v:Active Commit ID")
                    .path("v:Active Commit ID", "parent*", "v:Parent", "v:Path")
                    .triple("v:Parent","timestamp","v:Time")]
    if(timestamp){
        andArr.push( new WOQLQuery().less("v:Time",timestamp))
    }
    andArr.push( new WOQLQuery().triple("v:Parent","identifier","v:Commit ID")
                .triple("v:Parent","author","v:Author")
                .triple("v:Parent","message","v:Message"))           
    return woql.and(...andArr)
}

/** 
*get commits older than the specified commit id
*/
WOQLLibrary.prototype.previousCommits = function(commit_id,limit=10){
    return new WOQLQuery().using("_commits").limit(limit).select("v:Parent ID","v:Message","v:Commit ID","v:Time","v:Author").and(
            new WOQLQuery().and(
            new WOQLQuery().triple("v:Active Commit ID","@schema:identifier",new WOQLQuery().string(commit_id)),
            new WOQLQuery().path("v:Active Commit ID", "@schema:parent+","v:Parent", "v:Path"),
            new WOQLQuery().triple("v:Parent","@schema:identifier","v:Commit ID"),
            new WOQLQuery().triple("v:Parent","@schema:timestamp","v:Time"),
            new WOQLQuery().triple("v:Parent","@schema:author","v:Author"),
            new WOQLQuery().triple("v:Parent","@schema:message","v:Message"),
            new WOQLQuery().triple("v:Parent","@schema:parent","v:Parent ID")
        )
    )
} 

/**
 * Finds the id of the very first commit in a database's history
 *
 * This is useful for finding information about when, by who and why the database was created
 * The first commit is the only commit in the database that does not have a parent commit
 * Therefore this query will not change performance markedly with the size of the database - it does not have to traverse any commit chain
 */
WOQLLibrary.prototype.first_commit = function() {
    let noparent = new WOQLQuery()
        .using('_commits').select("v:Any Commit IRI")
          .and(
            new WOQLQuery().triple("v:Branch", "name", new WOQLQuery().string('main'))
            .triple("v:Branch", "head", "v:Active Commit ID")
            .path("v:Active Commit ID", "parent*", "v:Any Commit IRI", "v:Path"),

            new WOQLQuery().triple(
                'v:Any Commit IRI',
                '@schema:identifier',
                'v:Commit ID'
            ),
            new WOQLQuery().triple(
                'v:Any Commit IRI',
                '@schema:author',
                'v:Author'
            ),
            new WOQLQuery().triple(
                'v:Any Commit IRI',
                '@schema:message',
                'v:Message'
            ),
            new WOQLQuery()
                .not()
                .triple(
                    'v:Any Commit IRI',
                    '@schema:parent',
                    'v:Parent IRI'
                ),
                
        )
    return noparent
}

module.exports = WOQLLibrary
