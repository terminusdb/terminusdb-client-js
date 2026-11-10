const { expect } = require('chai');

describe('create new db tests', () => {
  it('create new db by send details data', (done) => {
    const dbid = 'test02';
    const doc = {
      base_uri: `http://local.terminusdb.com/${dbid}/data`,
      comment: 'test02 comment',
      label: 'test02 label',
    };

    const organizationid = 'organization01';
    global.sandbox
      .stub(globalThis, 'fetch')
      .resolves(new Response(JSON.stringify({ 'system:status': 'system:success' }), { status: 200 }));

    expect(global.client.connectionConfig.serverURL()).to.equal('http://127.0.0.1:6363/');
    global.client
      .createDatabase(dbid, doc, organizationid)
      .then((response) => {
        /*
                 *check that the connection object is filled well
                 */

        expect(response['system:status']).to.equal('system:success');
      })
      .then(done, done);
  });
});
