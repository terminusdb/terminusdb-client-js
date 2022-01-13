const { expect } = require('chai');
const ConnectionConfig = require('../lib/connectionConfig');

describe('connectionConfig tests', () => {
  const startServerUrl = 'http://localhost:6363/';
  const startDBid = 'testDB';
  const organization = 'admin';
  const params = {
    db: startDBid, organization, user: organization, key: 'myKey',
  };
  const connectionConfig = new ConnectionConfig(startServerUrl, params);

  const dbURL = 'http://localhost:6363/api/db/admin/testDB';

  it('check get server URL', () => {
    expect(connectionConfig.serverURL()).to.equal(startServerUrl);
    expect(connectionConfig.dbURL()).to.equal(dbURL);
    const cconf = { type: 'basic', user: 'admin', key: 'myKey' };
    console.log(connectionConfig.localAuth());
    expect(connectionConfig.localAuth()).to.eql(cconf);
  });

  it('check set branch', () => {
    connectionConfig.setBranch('myBranch');
    const queryURLBranch = 'http://localhost:6363/api/woql/admin/testDB/local/branch/myBranch';
    /*
         * the dbURL dosen't change
         */
    expect(connectionConfig.dbURL()).to.equal(dbURL);
    expect(connectionConfig.queryURL()).to.equal(queryURLBranch);
  });

  it('check set refId', () => {
    connectionConfig.setRef('gfhfjkflfgorpyuiioo');

    const queryURL = 'http://localhost:6363/api/woql/admin/testDB/local/commit/gfhfjkflfgorpyuiioo';

    expect(connectionConfig.queryURL()).to.equal(queryURL);
  });

  /*
     * get the schema in owl turtle encoding
     */
  it('check set class tripleUrl', () => {
    const classTripleURL = 'http://localhost:6363/api/triples/admin/testDB/local/commit/gfhfjkflfgorpyuiioo/schema/main';

    // console.log(JSON.stringify(connectionConfig.triplesURL(), null, 4));

    expect(connectionConfig.triplesURL('schema')).to.equal(classTripleURL);
  });

  it('check remove the refCommit', () => {
    const queryUrlBranch01 = 'http://localhost:6363/api/woql/admin/testDB/local/branch/myBranch';
    // const queryFrameBranch01 = 'http://localhost:6363/api/frame/admin/testDB/local/branch/myBranch'
    const queryTriplesBranch01 = 'http://localhost:6363/api/triples/admin/testDB/local/branch/myBranch/schema/main';
    /*
         *remove the ref commit it come to the
         */
    connectionConfig.setRef(false);
    expect(connectionConfig.queryURL()).to.equal(queryUrlBranch01);
    /// expect(connectionConfig.classFrameURL()).to.equal(queryFrameBranch01)
    expect(connectionConfig.triplesURL('schema')).to.equal(queryTriplesBranch01);

    // console.log(JSON.stringify(connectionConfig.queryURL(), null, 4));
  });

  it('check set branch', () => {
    const optimizeUrl = 'http://localhost:6363/api/optimize/admin/testDB/local/branch/%23%23branch01';
    /*
         * the dbURL dosen't change
         */
    expect(connectionConfig.optimizeBranchUrl('##branch01')).to.equal(optimizeUrl);
  });

  it('check remove the branch', () => {
    const queryUrlBranch01 = 'http://localhost:6363/api/woql/admin/testDB/local/branch/main';
    // const queryFrameBranch01 = 'http://localhost:6363/api/frame/admin/testDB/local/branch/main'
    const queryTriplesBranch01 = 'http://localhost:6363/api/triples/admin/testDB/local/branch/main/instance/main';
    /*
         *remove the ref commit it come to the
         */
    connectionConfig.setBranch(false);
    expect(connectionConfig.queryURL()).to.equal(queryUrlBranch01);
    // expect(connectionConfig.classFrameURL()).to.equal(queryFrameBranch01)
    expect(connectionConfig.triplesURL('instance')).to.equal(
      queryTriplesBranch01,
    );

    // console.log(JSON.stringify(connectionConfig.queryURL(), null, 4));
  });

  /* it('check copy', function() {
        let copy = connectionConfig.copy()
        expect(connectionConfig).to.eql(copy)
    }) */

  it('check update', () => {
    connectionConfig.update({ key: 'hello' });
    const res = { type: 'basic', user: 'admin', key: 'hello' };
    expect(connectionConfig.local_auth).to.eql(res);
  });

  it('check local basic auth', () => {
    connectionConfig.setLocalBasicAuth('hello', 'john');
    const res = { type: 'basic', user: 'john', key: 'hello' };
    expect(connectionConfig.local_auth).to.eql(res);
  });

  it('check local auth', () => {
    const res = { type: 'basic', user: 'john', key: 'hello' };
    connectionConfig.setLocalAuth(res);
    expect(connectionConfig.local_auth).to.eql(res);
  });

  it('check remote auth', () => {
    const res = { type: 'basic', user: 'john', key: 'hello' };
    connectionConfig.setRemoteAuth(res);
    expect(connectionConfig.remoteAuth()).to.eql(res);
  });

  it('check user URL', () => {
    const u = connectionConfig.userURL('john');
    const construct = `${startServerUrl}api/user/john`;
    expect(u).to.equal(construct);
  });

  it('check organization URL', () => {
    const o = connectionConfig.organizationURL('us');
    const construct = `${startServerUrl}api/organization/us`;
    expect(o).to.equal(construct);
  });

  it('check roles URL', () => {
    const o = connectionConfig.rolesURL();
    const construct = `${startServerUrl}api/role`;
    expect(o).to.equal(construct);
  });

  it('check update roles URL', () => {
    const o = connectionConfig.updateRolesURL();
    const construct = `${startServerUrl}api/update_role`;
    expect(o).to.equal(construct);
  });

  it('check clone URL', () => {
    const o = connectionConfig.cloneURL('frank');
    const construct = `${startServerUrl}api/clone/${organization}/frank`;
    expect(o).to.equal(construct);
  });

  it('check cloneable URL', () => {
    const o = connectionConfig.cloneableURL();
    const construct = `${startServerUrl}${organization}/${startDBid}`;
    expect(o).to.equal(construct);
  });

  it('check pull URL', () => {
    const o = connectionConfig.pullURL();
    const construct = `${startServerUrl}api/pull/${organization}/${startDBid}/local/branch/main`;
    expect(o).to.equal(construct);
  });

  it('check fetch URL', () => {
    const o = connectionConfig.fetchURL('origin');
    const construct = `${startServerUrl}api/fetch/${organization}/${startDBid}/origin/_commits`;
    expect(o).to.equal(construct);
  });

  it('check rebase URL', () => {
    const o = connectionConfig.rebaseURL();
    const construct = `${startServerUrl}api/rebase/${organization}/${startDBid}/local/branch/main`;
    expect(o).to.equal(construct);
  });

  it('check reset URL', () => {
    const o = connectionConfig.resetURL();
    const construct = `${startServerUrl}api/reset/${organization}/${startDBid}/local/branch/main`;
    expect(o).to.equal(construct);
  });

  it('check push URL', () => {
    const o = connectionConfig.pushURL();
    const construct = `${startServerUrl}api/push/${organization}/${startDBid}/local/branch/main`;
    expect(o).to.equal(construct);
  });

  it('check branch URL', () => {
    const o = connectionConfig.branchURL('dev');
    const construct = `${startServerUrl}api/branch/${organization}/${startDBid}/local/branch/dev`;
    expect(o).to.equal(construct);
  });

  it('check api URL', () => {
    const o = connectionConfig.apiURL();
    const construct = `${startServerUrl}api/`;
    expect(o).to.equal(construct);
  });

  it('check db', () => {
    const o = connectionConfig.db();
    expect(o).to.equal(startDBid);
  });

  it('check branch', () => {
    const o = connectionConfig.branch();
    expect(o).to.equal(connectionConfig.default_branch_id);
  });

  it('check ref', () => {
    const o = connectionConfig.ref();
    expect(o).to.equal(false);
  });

  it('check organization', () => {
    const o = connectionConfig.organization();
    expect(o).to.equal('admin');
  });

  it('check repo', () => {
    const o = connectionConfig.repo();
    expect(o).to.equal('local');
  });

  it('check local user', () => {
    const o = connectionConfig.localUser();
    expect(o).to.equal('john');
  });

  it('check user', () => {
    const o = connectionConfig.user();
    expect(o).to.equal('john');
  });

  it('check parseServerURL', () => {
    const str = 'https:/adf.com/';
    expect(() => {
      connectionConfig.parseServerURL(str);
    }).to.throw(`Invalid Server URL: ${str}`);
  });

  it('check clearCursor', () => {
    connectionConfig.clearCursor();
    expect(() => {
      connectionConfig.db();
    }).to.throw('Invalid database name');
  });

  it('check setError', () => {
    connectionConfig.setError('error 123');
    expect(connectionConfig.connection_error).to.equal('error 123');
  });

  it('check setDB', () => {
    connectionConfig.setDB('123');
    expect(connectionConfig.db()).to.equal('123');
  });

  it('check setOrganization', () => {
    connectionConfig.setOrganization('123');
    expect(connectionConfig.organization()).to.equal('123');
  });

  it('check setRepo', () => {
    connectionConfig.setRepo('origin');
    expect(connectionConfig.repo()).to.equal('origin');
  });

  it('check baseUrlEncode', () => {
    const db = '%6277&ˆˆˆ@ˆˆWˆTWTET#Y@&&GHHSHHS';
    connectionConfig.setDB(db);
    const dbBase = 'http://localhost:6363/api/woql/123/%256277%26%CB%86%CB%86%CB%86%40%CB%86%CB%86W%CB%86TWTET%23Y%40%26%26GHHSHHS';
    expect(connectionConfig.dbBase('woql')).to.equal(dbBase);
    expect(connectionConfig.db()).to.equal(db);
  });

  it('check serverUrlEncoding', () => {
    const url = 'http://127.0.0.1:6363/##TEAM_NAME/';
    expect(connectionConfig.serverUrlEncoding(url)).to.equal('http://127.0.0.1:6363/%23%23TEAM_NAME/');
  });

  it('check cloud url encoding', () => {
    const tmpClient = new ConnectionConfig('http://127.0.0.1:6363/##TEAM_NAME/');
    expect(tmpClient.serverURL()).to.equal('http://127.0.0.1:6363/%23%23TEAM_NAME/');
  });

  // serverUrlEncoding

  // const startServerUrl = 'http://localhost:6363/'
  // const startDBid = 'testDB'
  // const organization = 'admin'
});
