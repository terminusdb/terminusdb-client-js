'use strict'
var expect = require('chai').expect
var ConnectionConfig = require('../lib/connectionConfig')

describe('connectionConfig tests', function() {
    const startServerUrl = 'http://localhost:6363/'
    const startDBid = 'testDB'
    const organization = 'admin'
    const params = {db: startDBid, organization: organization, user: organization, key: 'myKey'}
    const connectionConfig = new ConnectionConfig(startServerUrl, params)

    const dbURL = 'http://localhost:6363/api/db/admin/testDB'

    it('check get server URL', function() {
        expect(connectionConfig.serverURL()).to.equal(startServerUrl)
        expect(connectionConfig.dbURL()).to.equal(dbURL)
        let cconf = {type: 'basic', user: 'admin', key: 'myKey'}
        console.log(connectionConfig.localAuth())
        expect(connectionConfig.localAuth()).to.eql(cconf)
    })

    it('check set branch', function() {
        connectionConfig.setBranch('myBranch')
        const queryURLBranch = 'http://localhost:6363/api/woql/admin/testDB/local/branch/myBranch'
        /*
         * the dbURL dosen't change
         */
        expect(connectionConfig.dbURL()).to.equal(dbURL)
        expect(connectionConfig.queryURL()).to.equal(queryURLBranch)
    })

    it('check set refId', function() {
        connectionConfig.setRef('gfhfjkflfgorpyuiioo')

        const queryURL = 'http://localhost:6363/api/woql/admin/testDB/local/commit/gfhfjkflfgorpyuiioo'

        expect(connectionConfig.queryURL()).to.equal(queryURL)
    })

    /*
     * get the schema in owl turtle encoding
     */
    it('check set class tripleUrl', function() {
        const classTripleURL =
            'http://localhost:6363/api/triples/admin/testDB/local/commit/gfhfjkflfgorpyuiioo/schema/main'

        // console.log(JSON.stringify(connectionConfig.triplesURL(), null, 4));

        expect(connectionConfig.triplesURL('schema')).to.equal(classTripleURL)
    })

    it('check remove the refCommit', function() {
        const queryUrlBranch01 = 'http://localhost:6363/api/woql/admin/testDB/local/branch/myBranch'
       // const queryFrameBranch01 = 'http://localhost:6363/api/frame/admin/testDB/local/branch/myBranch'
        const queryTriplesBranch01 =
            'http://localhost:6363/api/triples/admin/testDB/local/branch/myBranch/schema/main'
        /*
         *remove the ref commit it come to the
         */
        connectionConfig.setRef(false)
        expect(connectionConfig.queryURL()).to.equal(queryUrlBranch01)
        ///expect(connectionConfig.classFrameURL()).to.equal(queryFrameBranch01)
        expect(connectionConfig.triplesURL('schema')).to.equal(queryTriplesBranch01)

        //console.log(JSON.stringify(connectionConfig.queryURL(), null, 4));
    })

    it('check set branch', function() {
        const optimizeUrl = 'http://localhost:6363/api/optimize/admin/testDB/local/branch/%23%23branch01'
        /*
         * the dbURL dosen't change
         */
        expect(connectionConfig.optimizeBranchUrl('##branch01')).to.equal(optimizeUrl)

    })

    it('check remove the branch', function() {
        const queryUrlBranch01 = 'http://localhost:6363/api/woql/admin/testDB/local/branch/main'
        //const queryFrameBranch01 = 'http://localhost:6363/api/frame/admin/testDB/local/branch/main'
        const queryTriplesBranch01 =
            'http://localhost:6363/api/triples/admin/testDB/local/branch/main/instance/main'
        /*
         *remove the ref commit it come to the
         */
        connectionConfig.setBranch(false)
        expect(connectionConfig.queryURL()).to.equal(queryUrlBranch01)
        //expect(connectionConfig.classFrameURL()).to.equal(queryFrameBranch01)
        expect(connectionConfig.triplesURL('instance')).to.equal(
            queryTriplesBranch01,
        )

        //console.log(JSON.stringify(connectionConfig.queryURL(), null, 4));
    })
    
    

    /*it('check copy', function() {
        let copy = connectionConfig.copy()        
        expect(connectionConfig).to.eql(copy)
    })*/

    it('check update', function() {
        connectionConfig.update({key:"hello"})   
        let res = {type: 'basic', user: "admin", key: "hello" }     
        expect(connectionConfig.local_auth).to.eql(res)
    })

    it('check local basic auth', function() {
        connectionConfig.setLocalBasicAuth("hello", "john")   
        let res = {type: 'basic', user: "john", key: "hello" }     
        expect(connectionConfig.local_auth).to.eql(res)
    })

    it('check local auth', function() {
        let res = {type: 'basic', user: "john", key: "hello" }     
        connectionConfig.setLocalAuth(res)   
        expect(connectionConfig.local_auth).to.eql(res)
    })

    it('check remote auth', function() {
        let res = {type: 'basic', user: "john", key: "hello" }     
        connectionConfig.setRemoteAuth(res)   
        expect(connectionConfig.remoteAuth()).to.eql(res)
    })

    it('check user URL', function() {
        let u = connectionConfig.userURL("john")
        let construct = `${startServerUrl}api/user/john`
        expect(u).to.equal(construct)
    })

    it('check organization URL', function() {
        let o = connectionConfig.organizationURL("us")
        let construct = `${startServerUrl}api/organization/us`
        expect(o).to.equal(construct)
    })

   it('check roles URL', function() {
        let o = connectionConfig.rolesURL()
        let construct = `${startServerUrl}api/role`
        expect(o).to.equal(construct)
    })

    it('check update roles URL', function() {
        let o = connectionConfig.updateRolesURL()
        let construct = `${startServerUrl}api/update_role`
        expect(o).to.equal(construct)
    })

    it('check clone URL', function() {
        let o = connectionConfig.cloneURL("frank")
        let construct = `${startServerUrl}api/clone/${organization}/frank`
        expect(o).to.equal(construct)
    })

    it('check cloneable URL', function() {
        let o = connectionConfig.cloneableURL()
        let construct = `${startServerUrl}${organization}/${startDBid}`
        expect(o).to.equal(construct)
    })

    it('check pull URL', function() {
        let o = connectionConfig.pullURL()
        let construct = `${startServerUrl}api/pull/${organization}/${startDBid}/local/branch/main`
        expect(o).to.equal(construct)
    })

    it('check fetch URL', function() {
        let o = connectionConfig.fetchURL("origin")
        let construct = `${startServerUrl}api/fetch/${organization}/${startDBid}/origin/_commits`
        expect(o).to.equal(construct)
    })

    it('check rebase URL', function() {
        let o = connectionConfig.rebaseURL()
        let construct = `${startServerUrl}api/rebase/${organization}/${startDBid}/local/branch/main`
        expect(o).to.equal(construct)
    })

    it('check reset URL', function() {
        let o = connectionConfig.resetURL()
        let construct = `${startServerUrl}api/reset/${organization}/${startDBid}/local/branch/main`
        expect(o).to.equal(construct)
    })

    it('check push URL', function() {
        let o = connectionConfig.pushURL()
        let construct = `${startServerUrl}api/push/${organization}/${startDBid}/local/branch/main`
        expect(o).to.equal(construct)
    })

    it('check branch URL', function() {
        let o = connectionConfig.branchURL("dev")
        let construct = `${startServerUrl}api/branch/${organization}/${startDBid}/local/branch/dev`
        expect(o).to.equal(construct)
    })

    it('check api URL', function() {
        let o = connectionConfig.apiURL()
        let construct = `${startServerUrl}api/`
        expect(o).to.equal(construct)
    })

    it('check db', function() {
        let o = connectionConfig.db()
        expect(o).to.equal(startDBid)
    })

    it('check branch', function() {
        let o = connectionConfig.branch()
        expect(o).to.equal(connectionConfig.default_branch_id)
    })

    it('check ref', function() {
        let o = connectionConfig.ref()
        expect(o).to.equal(false)
    })

    it('check organization', function() {
        let o = connectionConfig.organization()
        expect(o).to.equal("admin")
    })

    it('check repo', function() {
        let o = connectionConfig.repo()
        expect(o).to.equal("local")
    })

    it('check local user', function() {
        let o = connectionConfig.localUser()
        expect(o).to.equal("john")
    })

    it('check user', function() {
        let o = connectionConfig.user()
        expect(o).to.equal("john")
    })

    it('check parseServerURL', function() {
        const str = "https:/adf.com/"
        expect(function(){
            connectionConfig.parseServerURL(str)
        }).to.throw(`Invalid Server URL: ${str}`);
    })

    it('check clearCursor', function() {
        connectionConfig.clearCursor()
        expect(function(){
            connectionConfig.db()
        }).to.throw('Invalid database name');
    })


    it('check setError', function() {
        connectionConfig.setError("error 123")
        expect(connectionConfig.connection_error).to.equal("error 123")
    })

    it('check setDB', function() {
        connectionConfig.setDB("123")
        expect(connectionConfig.db()).to.equal("123")
    })

    it('check setOrganization', function() {
        connectionConfig.setOrganization("123")
        expect(connectionConfig.organization()).to.equal("123")
    })

    it('check setRepo', function() {
        connectionConfig.setRepo("origin")
        expect(connectionConfig.repo()).to.equal("origin")
    })

    it('check baseUrlEncode', function() {
        const db = "%6277&ˆˆˆ@ˆˆWˆTWTET#Y@&&GHHSHHS"
        connectionConfig.setDB(db)
        const dbBase = 'http://localhost:6363/api/woql/123/%256277%26%CB%86%CB%86%CB%86%40%CB%86%CB%86W%CB%86TWTET%23Y%40%26%26GHHSHHS'
        expect(connectionConfig.dbBase('woql')).to.equal(dbBase)
        expect(connectionConfig.db()).to.equal(db)

    })

    it('check serverUrlEncoding', function() {
        const url = "http://127.0.0.1:6363/##TEAM_NAME/"
        expect(connectionConfig.serverUrlEncoding(url)).to.equal('http://127.0.0.1:6363/%23%23TEAM_NAME/')

    })

    it('check cloud url encoding', function() {
        const tmpClient = new ConnectionConfig("http://127.0.0.1:6363/##TEAM_NAME/")
        expect(tmpClient.serverURL()).to.equal('http://127.0.0.1:6363/%23%23TEAM_NAME/')

    })

    //serverUrlEncoding

    //const startServerUrl = 'http://localhost:6363/'
    //const startDBid = 'testDB'
    //const organization = 'admin'


})
