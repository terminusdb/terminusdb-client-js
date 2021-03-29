const WOQLLibrary = require('./query/woqlLibrary')

function WOQLClientTools(client) {
    this.client = client
    this.woqlLibrary = new WOQLLibrary()
}

/**
 * @param {string} orgName the user organization name
 */
WOQLClientTools.prototype.enrichLocalDB = function(orgName, dbName) {
    //set the system db
    this.client.setSystemDb()
    const dbInfo = this.client.databaseInfo(dbName, orgName) || {organization: orgName, id: dbName}
    const usings = `${orgName}/${dbName}`
    return this.woqlLibrary.assets_overview_result(usings, dbInfo, this.client, true)
}
module.exports = WOQLClientTools

/*
action: undefined
author: "TerminusDB"
branches: [{…}]
comment: "test_schema"
created: 1616584731.64566
id: "test_schema"
label: "test_schema"
message: "internal system operation"
organization: "admin"
prefixes: (2) [{…}, {…}]
schema: true
type: "local"
updated: 1616584731.64566
*/
