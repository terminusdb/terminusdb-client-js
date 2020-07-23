'use strict'
var expect = require('chai').expect
var ConnectionConfig = require('../lib/connectionConfig')

describe('connectionConfig tests', function() {
    const startServerUrl = 'http://localhost:6363/'
    const startDBid = 'testDB'
    const organization = 'admin'
    const params = {db: startDBid, organization: organization, user: organization, key: 'myKey'}
    const connectionConfig = new ConnectionConfig(startServerUrl, params)

    const dbURL = 'http://localhost:6363/db/admin/testDB'

    it('check get server URL', function() {
        expect(connectionConfig.serverURL()).to.equal(startServerUrl)
        expect(connectionConfig.dbURL()).to.equal(dbURL)
        let cconf = {type: 'basic', user: 'admin', key: 'myKey'}
        console.log(connectionConfig.localAuth())
        expect(connectionConfig.localAuth()).to.eql(cconf)
    })

    it('check set branch', function() {
        connectionConfig.setBranch('myBranch')
        const queryURLBranch = 'http://localhost:6363/woql/admin/testDB/local/branch/myBranch'
        /*
         * the dbURL dosen't change
         */
        expect(connectionConfig.dbURL()).to.equal(dbURL)
        expect(connectionConfig.queryURL()).to.equal(queryURLBranch)
    })

    it('check set refId', function() {
        connectionConfig.setRef('gfhfjkflfgorpyuiioo')

        const queryURL = 'http://localhost:6363/woql/admin/testDB/local/commit/gfhfjkflfgorpyuiioo'

        expect(connectionConfig.queryURL()).to.equal(queryURL)
    })

    it('check set class frameUrl', function() {
        const classFrameURL =
            'http://localhost:6363/frame/admin/testDB/local/commit/gfhfjkflfgorpyuiioo'

        //console.log(JSON.stringify(connectionConfig.triplesURL(), null, 4));

        expect(connectionConfig.classFrameURL()).to.equal(classFrameURL)
    })

    /*
     * get the schema in owl turtle encoding
     */
    it('check set class tripleUrl', function() {
        const classTripleURL =
            'http://localhost:6363/triples/admin/testDB/local/commit/gfhfjkflfgorpyuiioo/schema/main'

        // console.log(JSON.stringify(connectionConfig.triplesURL(), null, 4));

        expect(connectionConfig.triplesURL('schema')).to.equal(classTripleURL)
    })

    it('check remove the refCommit', function() {
        const queryUrlBranch01 = 'http://localhost:6363/woql/admin/testDB/local/branch/myBranch'
        const queryFrameBranch01 = 'http://localhost:6363/frame/admin/testDB/local/branch/myBranch'
        const queryTriplesBranch01 =
            'http://localhost:6363/triples/admin/testDB/local/branch/myBranch/schema/main'
        /*
         *remove the ref commit it come to the
         */
        connectionConfig.setRef(false)
        expect(connectionConfig.queryURL()).to.equal(queryUrlBranch01)
        expect(connectionConfig.classFrameURL()).to.equal(queryFrameBranch01)
        expect(connectionConfig.triplesURL('schema')).to.equal(queryTriplesBranch01)

        //console.log(JSON.stringify(connectionConfig.queryURL(), null, 4));
    })

    it('check remove the branch', function() {
        const queryUrlBranch01 = 'http://localhost:6363/woql/admin/testDB/local/branch/main'
        const queryFrameBranch01 = 'http://localhost:6363/frame/admin/testDB/local/branch/main'
        const queryTriplesBranch01 =
            'http://localhost:6363/triples/admin/testDB/local/branch/main/instance/myschemaName'
        /*
         *remove the ref commit it come to the
         */
        connectionConfig.setBranch(false)
        expect(connectionConfig.queryURL()).to.equal(queryUrlBranch01)
        expect(connectionConfig.classFrameURL()).to.equal(queryFrameBranch01)
        expect(connectionConfig.triplesURL('instance', 'myschemaName')).to.equal(
            queryTriplesBranch01,
        )

        //console.log(JSON.stringify(connectionConfig.queryURL(), null, 4));
    })

    /*
     *Generate URL for create / delete graph api endpoint
     */
    it('check graphURL', function() {
        const graphURL = 'http://localhost:6363/graph/admin/testDB/local/branch/main/schema/main'
        expect(connectionConfig.graphURL('schema', 'main')).to.equal(graphURL)
        //expect(connectionConfig.classFrameURL()).to.equal(queryFrameBranch01);
        //expect(connectionConfig.triplesURL('instance','myschemaName')).to.equal(queryTriplesBranch01);

        //console.log(JSON.stringify(connectionConfig.graphURL('schema','main'), null, 4));
    })
})
