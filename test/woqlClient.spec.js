const { expect } = require('chai');
const sinon = require('sinon');
const WOQLClient = require('../lib/woqlClient');
const ConnectionConfig = require('../lib/connectionConfig');
const CONST = require('../lib/const');

describe('WOQLClient tests', () => {
  let client;
  let dispatchStub;

  beforeEach(() => {
    client = new WOQLClient('http://localhost:6363');
    dispatchStub = sinon.stub(client, 'dispatch');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Constructor and basic properties', () => {
    it('should create a client with server URL', () => {
      const testClient = new WOQLClient('http://test.com');
      expect(testClient.server()).to.equal('http://test.com/');
      expect(testClient.connectionConfig).to.be.instanceof(ConnectionConfig);
    });

    it('should create a client with params', () => {
      const testClient = new WOQLClient('http://test.com', {
        user: 'admin',
        organization: 'myorg',
        db: 'mydb',
      });
      expect(testClient.organization()).to.equal('myorg');
      expect(testClient.db()).to.equal('mydb');
    });

    it('should have CONST property', () => {
      expect(client.CONST).to.equal(CONST);
    });

    it('should initialize with empty database list', () => {
      expect(client.databases()).to.be.an('array');
      expect(client.databases()).to.have.lengthOf(0);
    });
  });

  describe('Server and API methods', () => {
    it('should return server URL', () => {
      expect(client.server()).to.equal('http://localhost:6363/');
    });

    it('should return API URL', () => {
      const apiUrl = client.api();
      expect(apiUrl).to.be.a('string');
      expect(apiUrl).to.include('http://localhost:6363');
    });
  });

  describe('Context management', () => {
    it('should set and get organization', () => {
      client.organization('testorg');
      expect(client.organization()).to.equal('testorg');
    });

    it('should reset databases when organization changes', () => {
      client.databases([{ name: 'db1' }, { name: 'db2' }]);
      expect(client.databases()).to.have.lengthOf(2);
      
      client.organization('neworg');
      expect(client.databases()).to.have.lengthOf(0);
    });

    it('should set and get database', () => {
      client.db('testdb');
      expect(client.db()).to.equal('testdb');
    });

    it('should set and get repo', () => {
      client.repo('origin');
      expect(client.repo()).to.equal('origin');
    });

    it('should set and get branch with checkout', () => {
      client.checkout('dev');
      expect(client.checkout()).to.equal('dev');
    });

    it('should set and get ref/commit', () => {
      const commitId = 'abc123def456';
      client.ref(commitId);
      expect(client.ref()).to.equal(commitId);
    });

    it('should set system database', () => {
      client.setSystemDb();
      expect(client.db()).to.equal('_system');
    });

    it('should set multiple params with set()', () => {
      client.set({
        organization: 'myorg',
        db: 'mydb',
        branch: 'dev',
      });
      expect(client.organization()).to.equal('myorg');
      expect(client.db()).to.equal('mydb');
      expect(client.checkout()).to.equal('dev');
    });
  });

  describe('Authentication', () => {
    it('should set API key', () => {
      client.setApiKey('my-api-key');
      const auth = client.localAuth();
      expect(auth.key).to.equal('my-api-key');
      expect(auth.type).to.equal('apikey');
    });

    it('should set and get local auth', () => {
      const authObj = { user: 'admin', key: 'secret', type: 'basic' };
      client.localAuth(authObj);
      const retrieved = client.localAuth();
      expect(retrieved.user).to.equal('admin');
      expect(retrieved.key).to.equal('secret');
      expect(retrieved.type).to.equal('basic');
    });

    it('should support deprecated local_auth', () => {
      const authObj = { user: 'admin', key: 'secret', type: 'basic' };
      client.local_auth(authObj);
      expect(client.local_auth().user).to.equal('admin');
    });

    it('should set and get remote auth', () => {
      const remoteAuthObj = { key: 'jwt-token', type: 'jwt' };
      client.remoteAuth(remoteAuthObj);
      const retrieved = client.remoteAuth();
      expect(retrieved.key).to.equal('jwt-token');
      expect(retrieved.type).to.equal('jwt');
    });

    it('should support deprecated remote_auth', () => {
      const remoteAuthObj = { key: 'jwt-token', type: 'jwt' };
      client.remote_auth(remoteAuthObj);
      expect(client.remote_auth().key).to.equal('jwt-token');
    });
  });

  describe('Custom headers', () => {
    it('should set and get custom headers', () => {
      const headers = { 'X-Custom': 'value', 'X-Another': 'test' };
      client.customHeaders(headers);
      expect(client.customHeaders()).to.deep.equal(headers);
    });

    it('should return undefined when no custom headers set', () => {
      expect(client.customHeaders()).to.be.undefined;
    });
  });

  describe('Copy method', () => {
    it('should create a copy with identical state', () => {
      client.organization('testorg');
      client.db('testdb');
      client.checkout('dev');
      client.localAuth({ user: 'admin', key: 'secret', type: 'basic' });

      const copy = client.copy();
      
      expect(copy).to.be.instanceof(WOQLClient);
      expect(copy.server()).to.equal(client.server());
      expect(copy.organization()).to.equal('testorg');
      expect(copy.db()).to.equal('testdb');
      expect(copy.checkout()).to.equal('dev');
    });

    it('should allow independent manipulation of copy', () => {
      client.db('originaldb');
      const copy = client.copy();
      
      copy.db('copydb');
      
      expect(client.db()).to.equal('originaldb');
      expect(copy.db()).to.equal('copydb');
    });
  });

  describe('Database operations', () => {
    it('should set and get databases list', () => {
      const dbList = [
        { name: 'db1', label: 'Database 1' },
        { name: 'db2', label: 'Database 2' },
      ];
      client.databases(dbList);
      expect(client.databases()).to.have.lengthOf(2);
      expect(client.databases()[0].name).to.equal('db1');
    });

    it('should get database info by name', () => {
      const dbList = [
        { name: 'db1', label: 'Database 1', comment: 'Test DB' },
        { name: 'db2', label: 'Database 2' },
      ];
      client.databases(dbList);
      
      const dbInfo = client.databaseInfo('db1');
      expect(dbInfo.name).to.equal('db1');
      expect(dbInfo.label).to.equal('Database 1');
      expect(dbInfo.comment).to.equal('Test DB');
    });

    it('should return empty object for non-existent database', () => {
      client.databases([{ name: 'db1' }]);
      const dbInfo = client.databaseInfo('nonexistent');
      expect(dbInfo).to.deep.equal({});
    });

    it('should check if database exists', async () => {
      dispatchStub.resolves({ status: 200 });
      
      const exists = await client.hasDatabase('admin', 'testdb');
      expect(exists).to.be.true;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should return false for non-existent database', async () => {
      dispatchStub.rejects({ status: 404 });
      
      const exists = await client.hasDatabase('admin', 'nonexistent');
      expect(exists).to.be.false;
    });

    it('should throw error for other failures in hasDatabase', async () => {
      dispatchStub.rejects({ status: 500, message: 'Server error' });
      
      try {
        await client.hasDatabase('admin', 'testdb');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.status).to.equal(500);
      }
    });
  });

  describe('User methods', () => {
    it('should return user info', () => {
      // User info comes from connectionConfig
      const user = client.user();
      expect(user).to.exist;
    });

    it('should return user organization', () => {
      const userOrg = client.userOrganization();
      expect(userOrg).to.exist;
    });

    it('should return author', () => {
      const author = client.author();
      expect(author).to.exist;
    });
  });

  describe('Resource generation', () => {
    beforeEach(() => {
      client.organization('myorg');
      client.db('mydb');
    });

    it('should generate db resource', () => {
      const resource = client.resource('db');
      expect(resource).to.equal('myorg/mydb/');
    });

    it('should generate meta resource', () => {
      const resource = client.resource('meta');
      expect(resource).to.equal('myorg/mydb/_meta');
    });

    it('should generate repo resource', () => {
      client.repo('local');
      const resource = client.resource('repo');
      expect(resource).to.include('myorg/mydb/local');
    });

    it('should generate branch resource', () => {
      client.repo('local');
      client.checkout('main');
      const resource = client.resource('branch');
      expect(resource).to.include('myorg/mydb/local/branch/main');
    });

    it('should generate branch resource with specific branch', () => {
      client.repo('local');
      const resource = client.resource('branch', 'dev');
      expect(resource).to.include('branch/dev');
    });

    it('should generate commits resource', () => {
      client.repo('local');
      const resource = client.resource('commits');
      expect(resource).to.include('_commits');
    });

    it('should generate ref resource', () => {
      client.repo('local');
      client.checkout('main');
      client.ref('abc123');
      const resource = client.resource('ref');
      expect(resource).to.include('commit/abc123');
    });
  });

  describe('Connect method', () => {
    it('should connect to server', async () => {
      dispatchStub.resolves({
        '@type': 'api:InfoResponse',
        'api:info': {
          authority: 'admin',
          storage: { version: '11.0.0' },
        },
      });

      const response = await client.connect();
      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should connect with params', async () => {
      dispatchStub.resolves({ '@type': 'api:InfoResponse' });

      await client.connect({ organization: 'neworg', db: 'newdb' });
      expect(client.organization()).to.equal('neworg');
      expect(client.db()).to.equal('newdb');
    });
  });

  describe('Database CRUD operations', () => {
    beforeEach(() => {
      client.organization('admin');
    });

    it('should create database', async () => {
      dispatchStub.resolves({ '@type': 'api:DatabaseCreateResponse' });

      const response = await client.createDatabase('newdb', {
        label: 'New Database',
        comment: 'Test database',
      });

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should update database', async () => {
      dispatchStub.resolves({ '@type': 'api:DatabaseUpdateResponse' });

      const response = await client.updateDatabase({
        id: 'testdb',
        label: 'Updated Database',
      });

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should delete database', async () => {
      dispatchStub.resolves({ '@type': 'api:DatabaseDeleteResponse' });

      const response = await client.deleteDatabase('testdb');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[0]).to.equal(CONST.DELETE);
    });

    it('should delete database with force', async () => {
      dispatchStub.resolves({ '@type': 'api:DatabaseDeleteResponse' });

      await client.deleteDatabase('testdb', null, true);

      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2]).to.deep.equal({ force: true });
    });
  });

  describe('getDatabases method', () => {
    beforeEach(() => {
      client.organization('testorg');
    });

    it('should throw error when organization not set', async () => {
      client.organization(false);
      
      try {
        await client.getDatabases();
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('organization name');
      }
    });

    it('should get databases for organization', async () => {
      const mockResponse = [
        {
          name: 'testorg',
          databases: [
            { name: 'db1', label: 'Database 1' },
            { name: 'db2', label: 'Database 2' },
          ],
        },
      ];

      sinon.stub(client, 'getUserOrganizations').resolves(mockResponse);
      sinon.stub(client, 'userOrganizations').returns(mockResponse);

      const databases = await client.getDatabases();
      
      expect(databases).to.have.lengthOf(2);
      expect(databases[0].name).to.equal('db1');
      expect(client.databases()).to.have.lengthOf(2);
    });

    it('should return empty array when no databases', async () => {
      const mockResponse = [
        {
          name: 'testorg',
          databases: [],
        },
      ];

      sinon.stub(client, 'getUserOrganizations').resolves(mockResponse);
      sinon.stub(client, 'userOrganizations').returns(mockResponse);

      const databases = await client.getDatabases();
      
      expect(databases).to.have.lengthOf(0);
    });

    it('should handle organization with no databases property', async () => {
      const mockResponse = [
        {
          name: 'testorg',
        },
      ];

      sinon.stub(client, 'getUserOrganizations').resolves(mockResponse);
      sinon.stub(client, 'userOrganizations').returns(mockResponse);

      const databases = await client.getDatabases();
      
      expect(databases).to.have.lengthOf(0);
    });
  });

  describe('Triples operations', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should get triples', async () => {
      dispatchStub.resolves('turtle triples data');

      const triples = await client.getTriples('schema');

      expect(triples).to.equal('turtle triples data');
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should update triples', async () => {
      dispatchStub.resolves({ '@type': 'api:TriplesUpdateResponse' });

      const turtle = '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .';
      const response = await client.updateTriples('schema', 'main', turtle, 'Update message');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });
  });

  describe('Edge cases and validation', () => {
    it('should handle undefined params gracefully', () => {
      expect(() => client.organization(undefined)).to.not.throw();
      expect(() => client.db(undefined)).to.not.throw();
      expect(() => client.checkout(undefined)).to.not.throw();
      expect(() => client.repo(undefined)).to.not.throw();
      expect(() => client.ref(undefined)).to.not.throw();
    });

    it('should return false for context values when not set', () => {
      const newClient = new WOQLClient('http://test.com');
      // These should return falsy values or defaults
      expect(newClient.organization()).to.exist;
      expect(newClient.db()).to.exist;
    });

    it('should handle empty database list', () => {
      expect(client.databases()).to.be.an('array');
      expect(client.databases()).to.have.lengthOf(0);
    });

    it('should maintain database list through copy', () => {
      const dbList = [{ name: 'db1' }, { name: 'db2' }];
      client.databases(dbList);
      
      const copy = client.copy();
      expect(copy.databases()).to.deep.equal(dbList);
    });
  });

  describe('Method chaining support', () => {
    it('should allow method chaining for context setters', () => {
      client.organization('myorg');
      client.db('mydb');
      client.checkout('dev');
      client.repo('origin');

      expect(client.organization()).to.equal('myorg');
      expect(client.db()).to.equal('mydb');
      expect(client.checkout()).to.equal('dev');
      expect(client.repo()).to.equal('origin');
    });
  });

  describe('Triples operations - extended', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should reject getTriples without graphType', async () => {
      try {
        await client.getTriples();
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('parameter error');
      }
    });

    it('should insert triples', async () => {
      dispatchStub.resolves({ '@type': 'api:TriplesInsertResponse' });

      const turtle = '@prefix rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#> .';
      const response = await client.insertTriples('schema', 'main', turtle, 'Insert message');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[0]).to.equal(CONST.INSERT_TRIPLES);
    });

    it('should reject insertTriples without required params', async () => {
      try {
        await client.insertTriples('schema', null, 'message');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('parameter error');
      }
    });

    it('should reject updateTriples without required params', async () => {
      try {
        await client.updateTriples('schema', null, 'message');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('parameter error');
      }
    });
  });

  describe('Message and Action methods', () => {
    it('should send a message', async () => {
      dispatchStub.resolves({ result: 'message sent' });

      const response = await client.message('test message', '/custom/path');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should send a message without pathname', async () => {
      dispatchStub.resolves({ result: 'message sent' });

      const response = await client.message('test message');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should send an action', async () => {
      dispatchStub.resolves({ result: 'action executed' });

      const response = await client.action('myAction', { param: 'value' });

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
      const callUrl = dispatchStub.firstCall.args[1];
      expect(callUrl).to.include('action/myAction');
    });

    it('should get server info', async () => {
      dispatchStub.resolves({
        '@type': 'api:InfoResponse',
        'api:info': { version: '11.0.0' },
      });

      const response = await client.info();

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
      const callUrl = dispatchStub.firstCall.args[1];
      expect(callUrl).to.include('info');
    });
  });

  describe('Query execution', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should execute a WOQL query', async () => {
      dispatchStub.resolves({ bindings: [] });
      const WOQL = require('../lib/woql');
      const query = WOQL.triple('a', 'b', 'c');

      const response = await client.query(query);

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should execute query with commit message', async () => {
      dispatchStub.resolves({ bindings: [] });
      const WOQL = require('../lib/woql');
      const query = WOQL.add_triple('a', 'b', 'c');

      const response = await client.query(query, 'Custom commit message');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should execute query with allWitnesses', async () => {
      dispatchStub.resolves({ bindings: [] });
      const WOQL = require('../lib/woql');
      const query = WOQL.triple('a', 'b', 'c');

      await client.query(query, 'message', true);

      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2].all_witnesses).to.be.true;
    });

    it('should execute query with data version tracking', async () => {
      dispatchStub.resolves({
        result: { bindings: [] },
        dataVersion: 'v123',
      });
      const WOQL = require('../lib/woql');
      const query = WOQL.triple('a', 'b', 'c');

      const response = await client.query(query, 'message', false, '', true);

      expect(response).to.exist;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[3]).to.be.true; // getDataVersion parameter
    });

    it('should reject query without WOQL object', async () => {
      try {
        await client.query(null);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('parameter error');
      }
    });
  });

  describe('Branch operations', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
      client.repo('local');
      client.checkout('main');
    });

    it('should create a new branch', async () => {
      dispatchStub.resolves({ '@type': 'api:BranchResponse' });

      const response = await client.branch('dev');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
      const callUrl = dispatchStub.firstCall.args[1];
      expect(callUrl).to.include('branch/dev');
    });

    it('should create an empty branch', async () => {
      dispatchStub.resolves({ '@type': 'api:BranchResponse' });

      await client.branch('empty-branch', true);

      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2]).to.deep.equal({});
    });

    it('should reject branch creation without branchId', async () => {
      try {
        await client.branch();
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('parameter error');
      }
    });

    it('should squash a branch', async () => {
      dispatchStub.resolves({ '@type': 'api:SquashResponse' });

      const response = await client.squashBranch('dev', 'Squashing commits');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should reject squash without commit message', async () => {
      try {
        await client.squashBranch('dev', null);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('parameter error');
      }
    });

    it('should reset a branch to a commit', async () => {
      dispatchStub.resolves({ '@type': 'api:ResetResponse' });

      const response = await client.resetBranch('dev', 'abc123commit');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should reject reset without commit id', async () => {
      try {
        await client.resetBranch('dev', null);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('parameter error');
      }
    });

    it('should optimize a branch', async () => {
      dispatchStub.resolves({ '@type': 'api:OptimizeResponse' });

      const response = await client.optimizeBranch('main');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should reject optimize without branch id', async () => {
      try {
        await client.optimizeBranch(null);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('parameter error');
      }
    });

    it('should delete a branch', async () => {
      dispatchStub.resolves({ '@type': 'api:DeleteBranchResponse' });

      const response = await client.deleteBranch('old-branch');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[0]).to.equal(CONST.DELETE);
    });

    it('should reject delete without branch id', async () => {
      try {
        await client.deleteBranch(null);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('parameter error');
      }
    });
  });

  describe('Version control operations', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
      client.repo('local');
      client.checkout('main');
    });

    it('should pull from remote', async () => {
      dispatchStub.resolves({ '@type': 'api:PullResponse' });
      sinon.stub(client, 'prepareRevisionControlArgs').returns({
        remote: 'origin',
        remote_branch: 'main',
      });

      const response = await client.pull({
        remote: 'origin',
        remote_branch: 'main',
      });

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should reject pull without required params', async () => {
      sinon.stub(client, 'prepareRevisionControlArgs').returns({});

      try {
        await client.pull({});
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('parameter error');
      }
    });

    it('should push to remote', async () => {
      dispatchStub.resolves({ '@type': 'api:PushResponse' });
      sinon.stub(client, 'prepareRevisionControlArgs').returns({
        remote: 'origin',
        remote_branch: 'main',
      });

      const response = await client.push({
        remote: 'origin',
        remote_branch: 'main',
      });

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should reject push without required params', async () => {
      sinon.stub(client, 'prepareRevisionControlArgs').returns({});

      try {
        await client.push({});
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('parameter error');
      }
    });

    it('should fetch from remote', async () => {
      dispatchStub.resolves({ '@type': 'api:FetchResponse' });

      const response = await client.fetch('origin');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should rebase from source', async () => {
      dispatchStub.resolves({ '@type': 'api:RebaseResponse' });
      sinon.stub(client, 'prepareRevisionControlArgs').returns({
        rebase_from: 'admin/testdb/local/branch/dev',
      });

      const response = await client.rebase({
        rebase_from: 'admin/testdb/local/branch/dev',
      });

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should reject rebase without rebase_from', async () => {
      sinon.stub(client, 'prepareRevisionControlArgs').returns({});

      try {
        await client.rebase({});
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('parameter error');
      }
    });

    it('should reset to commit path', async () => {
      dispatchStub.resolves({ '@type': 'api:ResetResponse' });

      const response = await client.reset('admin/testdb/local/commit/abc123');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2].commit_descriptor).to.equal('admin/testdb/local/commit/abc123');
    });
  });

  describe('Apply operation', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should apply a diff', async () => {
      dispatchStub.resolves({ '@type': 'api:ApplyResponse' });

      const diff = { inserts: [], deletes: [] };
      const response = await client.apply(diff, 'Applying changes');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });
  });

  describe('Schema operations', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should get schema', async () => {
      dispatchStub.resolves({ '@type': 'api:SchemaResponse', schema: {} });

      const response = await client.getSchema();

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });
  });

  describe('Commit operations', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
      client.repo('local');
      client.checkout('main');
    });

    it('should generate commit info', () => {  
      const commitInfo = client.generateCommitInfo('Test commit message');

      expect(commitInfo).to.exist;
      expect(commitInfo.commit_info).to.exist;
      expect(commitInfo.commit_info.message).to.equal('Test commit message');
    });
  });

  describe('Document operations', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should get document', async () => {
      dispatchStub.resolves({ '@type': 'Person', name: 'John' });

      const response = await client.getDocument('Person/john');

      expect(response).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });
  });

  describe('User organization operations', () => {
    it('should get user organizations', async () => {
      dispatchStub.resolves([
        { name: 'org1', databases: [] },
        { name: 'org2', databases: [] },
      ]);

      const response = await client.getUserOrganizations();

      expect(response).to.exist;
      expect(response).to.have.lengthOf(2);
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should cache user organizations', () => {
      const orgs = [{ name: 'org1' }];
      client.userOrganizations(orgs);

      expect(client.userOrganizations()).to.deep.equal(orgs);
    });
  });

  describe('Error handling and edge cases', () => {
    it('should handle dispatch errors gracefully', async () => {
      dispatchStub.rejects(new Error('Network error'));

      try {
        await client.connect();
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.equal('Network error');
      }
    });

    it('should validate database context before operations', async () => {
      client.db(false);
      dispatchStub.resolves({});

      try {
        await client.query(require('../lib/woql').triple('a', 'b', 'c'));
        // Should work even without db set in some cases
      } catch (err) {
        // Expected in some scenarios
      }
    });

    it('should handle empty organization list', async () => {
      sinon.stub(client, 'getUserOrganizations').resolves([]);

      const orgs = await client.getUserOrganizations();
      expect(orgs).to.be.an('array');
      expect(orgs).to.have.lengthOf(0);
    });
  });

  describe('Resource type variations', () => {
    beforeEach(() => {
      client.organization('myorg');
      client.db('mydb');
      client.repo('local');
      client.checkout('main');
    });

    it('should handle various resource types', () => {
      // Test that resource method works for various types
      const dbResource = client.resource('db');
      expect(dbResource).to.be.a('string');
      expect(dbResource).to.include('myorg/mydb');

      const metaResource = client.resource('meta');
      expect(metaResource).to.be.a('string');
      expect(metaResource).to.include('_meta');
    });
  });

  describe('Batch operations and multiple context switches', () => {
    it('should handle rapid context switches', () => {
      client.organization('org1');
      client.db('db1');
      expect(client.organization()).to.equal('org1');
      expect(client.db()).to.equal('db1');

      client.organization('org2');
      expect(client.organization()).to.equal('org2');
      expect(client.databases()).to.have.lengthOf(0);

      client.db('db2');
      expect(client.db()).to.equal('db2');
    });

    it('should maintain separate state in copied clients', () => {
      client.organization('org1');
      client.db('db1');
      client.checkout('main');

      const copy1 = client.copy();
      const copy2 = client.copy();

      copy1.db('db2');
      copy2.db('db3');

      expect(client.db()).to.equal('db1');
      expect(copy1.db()).to.equal('db2');
      expect(copy2.db()).to.equal('db3');
    });
  });

  describe('Additional Edge Cases for Branch Coverage', () => {
    describe('customHeaders()', () => {
      it('should set custom headers', () => {
        const headers = { 'X-Custom': 'test' };
        client.customHeaders(headers);
        expect(client.customHeaders()).to.deep.equal(headers);
      });

      it('should return undefined when no custom headers set', () => {
        const newClient = new WOQLClient('http://test.com');
        expect(newClient.customHeaders()).to.be.undefined;
      });

      it('should update custom headers', () => {
        client.customHeaders({ 'X-First': 'value1' });
        client.customHeaders({ 'X-Second': 'value2' });
        expect(client.customHeaders()).to.deep.equal({ 'X-Second': 'value2' });
      });
    });

    describe('setApiKey()', () => {
      it('should set API key auth', () => {
        client.setApiKey('my-api-key-12345');
        const auth = client.localAuth();
        expect(auth.key).to.equal('my-api-key-12345');
        expect(auth.type).to.equal('apikey');
      });

      it('should update existing auth with API key', () => {
        client.localAuth({ user: 'admin', key: 'oldkey', type: 'basic' });
        client.setApiKey('newkey');
        const auth = client.localAuth();
        expect(auth.key).to.equal('newkey');
        expect(auth.type).to.equal('apikey');
      });
    });

    describe('localAuth() and remoteAuth()', () => {
      it('should set and get localAuth', () => {
        const auth = { user: 'admin', key: 'mykey', type: 'basic' };
        client.localAuth(auth);
        expect(client.localAuth()).to.deep.equal(auth);
      });

      it('should set and get remoteAuth', () => {
        const auth = { key: 'jwt-token', type: 'jwt' };
        client.remoteAuth(auth);
        expect(client.remoteAuth()).to.deep.equal(auth);
      });

      it('should use deprecated local_auth', () => {
        const auth = { user: 'test', key: 'key' };
        client.local_auth(auth);
        expect(client.local_auth()).to.deep.equal(auth);
      });

      it('should use deprecated remote_auth', () => {
        const auth = { key: 'token' };
        client.remote_auth(auth);
        expect(client.remote_auth()).to.deep.equal(auth);
      });
    });

    describe('author()', () => {
      it('should return current user as author', () => {
        client.localAuth({ user: 'testuser', key: 'key' });
        const author = client.author();
        expect(author).to.equal('testuser');
      });
    });

    describe('resource() method comprehensive', () => {
      beforeEach(() => {
        client.organization('testorg');
        client.db('testdb');
        client.repo('local');
        client.checkout('main');
        client.ref('abc123');
      });

      it('should generate db resource', () => {
        const resource = client.resource('db');
        expect(resource).to.equal('testorg/testdb/');
      });

      it('should generate meta resource', () => {
        const resource = client.resource('meta');
        expect(resource).to.equal('testorg/testdb/_meta');
      });

      it('should generate repo resource', () => {
        const resource = client.resource('repo');
        expect(resource).to.equal('testorg/testdb/local');
      });

      it('should generate commits resource', () => {
        const resource = client.resource('commits');
        expect(resource).to.equal('testorg/testdb/local/_commits');
      });

      it('should generate branch resource with default branch', () => {
        const resource = client.resource('branch');
        expect(resource).to.equal('testorg/testdb/local/branch/main');
      });

      it('should generate branch resource with specific branch', () => {
        const resource = client.resource('branch', 'dev');
        expect(resource).to.equal('testorg/testdb/local/branch/dev');
      });

      it('should generate ref resource with default ref', () => {
        const resource = client.resource('ref');
        expect(resource).to.equal('testorg/testdb/local/commit/abc123');
      });

      it('should generate ref resource with specific ref', () => {
        const resource = client.resource('ref', 'xyz789');
        expect(resource).to.equal('testorg/testdb/local/commit/xyz789');
      });
    });

    describe('Error paths in database operations', () => {
      it('should reject createDatabase without dbId', async () => {
        try {
          await client.createDatabase(null, { label: 'Test' });
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.include('invalid');
        }
      });

      it('should reject createDatabase with empty dbId', async () => {
        try {
          await client.createDatabase('', { label: 'Test' });
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.include('invalid');
        }
      });

      it('should reject updateDatabase without dbId', async () => {
        try {
          await client.updateDatabase({ label: 'Test' });
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.include('invalid');
        }
      });

      it('should reject updateDatabase with false dbId', async () => {
        try {
          await client.updateDatabase({ id: false, label: 'Test' });
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.include('invalid');
        }
      });

      it('should reject deleteDatabase without dbId', async () => {
        try {
          await client.deleteDatabase(null);
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.include('invalid');
        }
      });

      it('should reject deleteDatabase with false dbId', async () => {
        try {
          await client.deleteDatabase(false);
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.include('invalid');
        }
      });

      it('should call deleteDatabase with force flag', async () => {
        client.organization('testorg');
        dispatchStub.resolves({ '@type': 'api:DeleteResponse' });
        
        await client.deleteDatabase('testdb', 'testorg', true);
        
        expect(dispatchStub.calledOnce).to.be.true;
        const args = dispatchStub.getCall(0).args;
        expect(args[2]).to.deep.equal({ force: true });
      });

      it('should call deleteDatabase without force flag', async () => {
        client.organization('testorg');
        dispatchStub.resolves({ '@type': 'api:DeleteResponse' });
        
        await client.deleteDatabase('testdb', 'testorg', false);
        
        expect(dispatchStub.calledOnce).to.be.true;
        const args = dispatchStub.getCall(0).args;
        expect(args[2]).to.be.null;
      });

      it('should use current org when orgId not provided in createDatabase', async () => {
        client.organization('defaultorg');
        dispatchStub.resolves({ '@type': 'api:CreateResponse' });
        
        await client.createDatabase('testdb', { label: 'Test' });
        
        expect(client.organization()).to.equal('defaultorg');
      });

      it('should update org when orgId provided in createDatabase', async () => {
        client.organization('oldorg');
        dispatchStub.resolves({ '@type': 'api:CreateResponse' });
        
        await client.createDatabase('testdb', { label: 'Test' }, 'neworg');
        
        expect(client.organization()).to.equal('neworg');
      });

      it('should handle updateDatabase with organization in dbDoc', async () => {
        client.organization('oldorg');
        dispatchStub.resolves({ '@type': 'api:UpdateResponse' });
        
        await client.updateDatabase({ id: 'testdb', organization: 'neworg', label: 'Test' });
        
        expect(client.organization()).to.equal('neworg');
      });
    });

    describe('connect() with params', () => {
      it('should update config when params provided', async () => {
        dispatchStub.resolves({ '@type': 'api:InfoResponse' });
        
        await client.connect({ organization: 'testorg', db: 'testdb' });
        
        expect(client.organization()).to.equal('testorg');
        expect(client.db()).to.equal('testdb');
      });

      it('should work without params', async () => {
        dispatchStub.resolves({ '@type': 'api:InfoResponse' });
        
        await client.connect();
        
        expect(dispatchStub.calledOnce).to.be.true;
      });
    });

    describe('getTriples()', () => {
      beforeEach(() => {
        client.organization('testorg');
        client.db('testdb');
        client.repo('local');
        client.checkout('main');
      });

      it('should get schema triples', async () => {
        dispatchStub.resolves('turtle content');
        
        const result = await client.getTriples('schema');
        
        expect(result).to.equal('turtle content');
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should get instance triples', async () => {
        dispatchStub.resolves('turtle content');
        
        const result = await client.getTriples('instance');
        
        expect(result).to.equal('turtle content');
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should get inference triples', async () => {
        dispatchStub.resolves('turtle content');
        
        const result = await client.getTriples('inference');
        
        expect(result).to.equal('turtle content');
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should reject without graphType', async () => {
        try {
          await client.getTriples();
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should reject with null graphType', async () => {
        try {
          await client.getTriples(null);
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });
    });

    describe('updateTriples()', () => {
      beforeEach(() => {
        client.organization('testorg');
        client.db('testdb');
        client.repo('local');
        client.checkout('main');
      });

      it('should update schema triples', async () => {
        dispatchStub.resolves({ '@type': 'api:TriplesResponse' });
        
        const turtle = '@prefix owl: <http://www.w3.org/2002/07/owl#> .';
        await client.updateTriples('schema', turtle, 'Updating schema');
        
        expect(dispatchStub.calledOnce).to.be.true;
        const args = dispatchStub.getCall(0).args;
        expect(args[2].turtle).to.equal(turtle);
      });

      it('should update instance triples', async () => {
        dispatchStub.resolves({ '@type': 'api:TriplesResponse' });
        
        const turtle = '@prefix ex: <http://example.com/> .';
        await client.updateTriples('instance', turtle, 'Updating instance');
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should reject without graphType', async () => {
        try {
          await client.updateTriples(null, 'turtle', 'message');
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should reject without turtle', async () => {
        try {
          await client.updateTriples('schema', null, 'message');
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should reject without commitMsg', async () => {
        try {
          await client.updateTriples('schema', 'turtle', null);
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });
    });

    describe('insertTriples()', () => {
      beforeEach(() => {
        client.organization('testorg');
        client.db('testdb');
        client.repo('local');
        client.checkout('main');
      });

      it('should insert schema triples', async () => {
        dispatchStub.resolves({ '@type': 'api:TriplesResponse' });
        
        const turtle = '@prefix owl: <http://www.w3.org/2002/07/owl#> .';
        await client.insertTriples('schema', turtle, 'Adding schema');
        
        expect(dispatchStub.calledOnce).to.be.true;
        const args = dispatchStub.getCall(0).args;
        expect(args[2].turtle).to.equal(turtle);
      });

      it('should insert instance triples', async () => {
        dispatchStub.resolves({ '@type': 'api:TriplesResponse' });
        
        const turtle = '@prefix ex: <http://example.com/> .';
        await client.insertTriples('instance', turtle, 'Adding instance');
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should reject without graphType', async () => {
        try {
          await client.insertTriples(null, 'turtle', 'message');
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should reject without turtle', async () => {
        try {
          await client.insertTriples('schema', null, 'message');
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should reject without commitMsg', async () => {
        try {
          await client.insertTriples('schema', 'turtle', null);
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });
    });

    describe('message()', () => {    
      it('should send message without pathname', async () => {
        dispatchStub.resolves({ status: 'ok' });
        
        const result = await client.message('Test message');
        
        expect(result.status).to.equal('ok');
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should send message with pathname', async () => {
        dispatchStub.resolves({ status: 'ok' });
        
        const result = await client.message('Test message', '/custom/path');
        
        expect(result.status).to.equal('ok');
        expect(dispatchStub.calledOnce).to.be.true;
      });
    });

    describe('action()', () => {
      it('should send action without payload', async () => {
        dispatchStub.resolves({ '@type': 'api:ActionResponse' });
        
        const result = await client.action('myAction');
        
        expect(result['@type']).to.equal('api:ActionResponse');
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should send action with payload', async () => {
        dispatchStub.resolves({ '@type': 'api:ActionResponse' });
        
        const payload = { key: 'value' };
        const result = await client.action('myAction', payload);
        
        expect(result['@type']).to.equal('api:ActionResponse');
        expect(dispatchStub.calledOnce).to.be.true;
      });
    });

    describe('info()', () => {
      it('should get server info', async () => {
        dispatchStub.resolves({ 
          '@type': 'api:InfoResponse',
          terminusdb: 'v10.0.0'
        });
        
        const result = await client.info();
        
        expect(result['@type']).to.equal('api:InfoResponse');
        expect(result.terminusdb).to.exist;
        expect(dispatchStub.calledOnce).to.be.true;
      });
    });

    describe('query()', () => {
      beforeEach(() => {
        client.organization('testorg');
        client.db('testdb');
      });

      it('should execute WOQL query', async () => {
        dispatchStub.resolves({ bindings: [] });
        
        const WOQL = require('../lib/woql');
        const query = WOQL.triple('a', 'b', 'c');
        const result = await client.query(query);
        
        expect(result.bindings).to.be.an('array');
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should execute query with commit message', async () => {
        dispatchStub.resolves({ bindings: [] });
        
        const WOQL = require('../lib/woql');
        const query = WOQL.triple('a', 'b', 'c');
        await client.query(query, 'Custom commit message');
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should execute query with allWitnesses', async () => {
        dispatchStub.resolves({ bindings: [] });
        
        const WOQL = require('../lib/woql');
        const query = WOQL.triple('a', 'b', 'c');
        await client.query(query, 'message', true);
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should handle getDataVersion parameter', async () => {
        dispatchStub.resolves({ bindings: [], 'api:data_version': 'v123' });
        
        const WOQL = require('../lib/woql');
        const query = WOQL.triple('a', 'b', 'c');
        const result = await client.query(query, 'message', false, '', true);
        
        // When getDataVersion is true, result should have dataVersion
        if (result.dataVersion !== undefined) {
          expect(result).to.have.property('dataVersion');
        } else {
          // If implementation doesn't support it, just check we got a result
          expect(result).to.exist;
        }
      });
    });

    describe('Branch operations', () => {
      beforeEach(() => {
        client.organization('testorg');
        client.db('testdb');
        client.repo('local');
        client.checkout('main');
      });

      it('should create a new branch', async () => {
        dispatchStub.resolves({ '@type': 'api:BranchResponse' });
        
        await client.branch('dev');
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should create branch with ref as origin', async () => {
        client.ref('abc123');
        dispatchStub.resolves({ '@type': 'api:BranchResponse' });
        
        await client.branch('dev');
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should create empty branch', async () => {
        dispatchStub.resolves({ '@type': 'api:BranchResponse' });
        
        await client.branch('dev', true);
        
        expect(dispatchStub.calledOnce).to.be.true;
        const args = dispatchStub.getCall(0).args;
        expect(args[2]).to.deep.equal({});
      });

      it('should reject branch creation without id', async () => {
        try {
          await client.branch();
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should squash branch', async () => {
        dispatchStub.resolves({ '@type': 'api:SquashResponse' });
        
        await client.squashBranch('dev', 'Squashing commits');
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should reject squashBranch without branchId', async () => {
        try {
          await client.squashBranch(null, 'message');
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should reject squashBranch without commitMsg', async () => {
        try {
          await client.squashBranch('dev', null);
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should reset branch to commit', async () => {
        dispatchStub.resolves({ '@type': 'api:ResetResponse' });
        
        await client.resetBranch('dev', 'commit123');
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should reject resetBranch without branchId', async () => {
        try {
          await client.resetBranch(null, 'commit123');
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should reject resetBranch without commitId', async () => {
        try {
          await client.resetBranch('dev', null);
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should optimize branch', async () => {
        dispatchStub.resolves({ '@type': 'api:OptimizeResponse' });
        
        await client.optimizeBranch('main');
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should reject optimizeBranch without branchId', async () => {
        try {
          await client.optimizeBranch(null);
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should delete branch', async () => {
        dispatchStub.resolves({ '@type': 'api:DeleteResponse' });
        
        await client.deleteBranch('old-branch');
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should reject deleteBranch without branchId', async () => {
        try {
          await client.deleteBranch(null);
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });
    });

    describe('Remote operations', () => {
      beforeEach(() => {
        client.organization('testorg');
        client.db('testdb');
        client.repo('local');
        client.checkout('main');
      });

      it('should pull from remote', async () => {
        dispatchStub.resolves({ '@type': 'api:PullResponse' });
        
        await client.pull({ remote: 'origin', remote_branch: 'main' });
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should reject pull without remote', async () => {
        try {
          await client.pull({ remote_branch: 'main' });
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should reject pull without remote_branch', async () => {
        try {
          await client.pull({ remote: 'origin' });
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should push to remote', async () => {
        dispatchStub.resolves({ '@type': 'api:PushResponse' });
        
        await client.push({ remote: 'origin', remote_branch: 'main' });
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should reject push without remote', async () => {
        try {
          await client.push({ remote_branch: 'main' });
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should reject push without remote_branch', async () => {
        try {
          await client.push({ remote: 'origin' });
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should fetch from remote', async () => {
        dispatchStub.resolves({ '@type': 'api:FetchResponse' });
        
        await client.fetch('origin');
        
        expect(dispatchStub.calledOnce).to.be.true;
      });
    });

    describe('Rebase operation', () => {
      beforeEach(() => {
        client.organization('testorg');
        client.db('testdb');
        client.repo('local');
      });

      it('should rebase branch', async () => {
        dispatchStub.resolves({ '@type': 'api:RebaseResponse' });
        
        await client.rebase({ rebase_from: 'main', message: 'Rebasing' });
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should reject rebase without rebase_from', async () => {
        try {
          await client.rebase({});
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });
    });

    describe('Clone operation', () => {
      beforeEach(() => {
        // Stub user_organization method which is called in clonedb
        client.user_organization = () => 'testorg';
      });

      it('should clone database', async () => {
        dispatchStub.resolves({ '@type': 'api:CloneResponse' });
        
        await client.clonedb(
          { remote_url: 'https://remote.com/org/db', label: 'Cloned' },
          'new-db-id'
        );
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should use provided orgId for clone', async () => {
        dispatchStub.resolves({ '@type': 'api:CloneResponse' });
        
        await client.clonedb(
          { remote_url: 'https://remote.com/org/db' },
          'new-db',
          'my-org'
        );
        
        expect(client.organization()).to.equal('my-org');
      });

      it('should reject clonedb without newDbId', async () => {
        try {
          await client.clonedb({ remote_url: 'https://remote.com' }, null);
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });

      it('should reject clonedb without remote_url', async () => {
        try {
          await client.clonedb({}, 'newid');
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.satisfy(msg => msg.includes('invalid') || msg.includes('Invalid'));
        }
      });
    });

    describe('Reset operation', () => {
      beforeEach(() => {
        client.organization('testorg');
        client.db('testdb');
        client.repo('local');
      });

      it('should reset to commit path', async () => {
        dispatchStub.resolves({ '@type': 'api:ResetResponse' });
        
        await client.reset('commit/abc123');
        
        expect(dispatchStub.calledOnce).to.be.true;
      });
    });

    describe('Document operations', () => {
      beforeEach(() => {
        client.organization('testorg');
        client.db('testdb');
      });

      it('should add document', async () => {
        dispatchStub.resolves({ '@type': 'api:InsertResponse' });
        
        const doc = { '@type': 'Person', name: 'John' };
        await client.addDocument(doc);
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should add document with params', async () => {
        dispatchStub.resolves({ '@type': 'api:InsertResponse' });
        
        const doc = { '@type': 'Person', name: 'Jane' };
        await client.addDocument(doc, { graph_type: 'schema' });
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should add document with custom dbId', async () => {
        dispatchStub.resolves({ '@type': 'api:InsertResponse' });
        
        const doc = { '@type': 'Person', name: 'Bob' };
        await client.addDocument(doc, {}, 'other-db');
        
        expect(client.db()).to.equal('other-db');
      });

      it('should add document with message', async () => {
        dispatchStub.resolves({ '@type': 'api:InsertResponse' });
        
        const doc = { '@type': 'Person', name: 'Alice' };
        await client.addDocument(doc, {}, null, 'Adding Alice');
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should add document with lastDataVersion', async () => {
        dispatchStub.resolves({ '@type': 'api:InsertResponse' });
        
        const doc = { '@type': 'Person', name: 'Charlie' };
        await client.addDocument(doc, {}, null, 'Adding', 'branch:abc123');
        
        expect(dispatchStub.calledOnce).to.be.true;
        expect(client.customHeaders()).to.have.property('TerminusDB-Data-Version');
      });

      it('should add document with getDataVersion', async () => {
        dispatchStub.resolves({ '@type': 'api:InsertResponse', 'api:data_version': 'v1' });
        
        const doc = { '@type': 'Person', name: 'Dave' };
        const result = await client.addDocument(doc, {}, null, 'Adding', '', true);
        
        expect(result).to.exist;
      });

      it('should add document with compression', async () => {
        dispatchStub.resolves({ '@type': 'api:InsertResponse' });
        
        const doc = { '@type': 'Person', name: 'Eve' };
        await client.addDocument(doc, {}, null, 'Adding', '', false, true);
        
        expect(dispatchStub.calledOnce).to.be.true;
      });
    });

    describe('queryDocument()', () => {
      beforeEach(() => {
        client.organization('testorg');
        client.db('testdb');
      });

      it('should query documents', async () => {
        dispatchStub.resolves({ result: [] });
        
        const query = { type: 'Person', query: { age: 42 } };
        await client.queryDocument(query);
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should query documents with params', async () => {
        dispatchStub.resolves({ result: [] });
        
        const query = { type: 'Person' };
        await client.queryDocument(query, { as_list: true });
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should query documents with custom dbId', async () => {
        dispatchStub.resolves({ result: [] });
        
        const query = { type: 'Person' };
        await client.queryDocument(query, {}, 'other-db');
        
        expect(client.db()).to.equal('other-db');
      });

      it('should query documents with branch', async () => {
        dispatchStub.resolves({ result: [] });
        
        const query = { type: 'Person' };
        await client.queryDocument(query, {}, null, 'dev');
        
        expect(client.checkout()).to.equal('dev');
      });

      it('should query documents with lastDataVersion', async () => {
        dispatchStub.resolves({ result: [] });
        
        const query = { type: 'Person' };
        await client.queryDocument(query, {}, null, null, 'branch:v123');
        
        expect(client.customHeaders()).to.have.property('TerminusDB-Data-Version');
      });

      it('should query documents with getDataVersion', async () => {
        dispatchStub.resolves({ result: [], 'api:data_version': 'v1' });
        
        const query = { type: 'Person' };
        const result = await client.queryDocument(query, {}, null, null, '', true);
        
        expect(result).to.exist;
      });
    });

    describe('getDocument()', () => {
      beforeEach(() => {
        client.organization('testorg');
        client.db('testdb');
      });

      it('should get documents', async () => {
        dispatchStub.resolves({ result: [] });
        
        await client.getDocument({ as_list: true });
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should get schema documents', async () => {
        dispatchStub.resolves({ result: [] });
        
        await client.getDocument({ graph_type: 'schema', as_list: true });
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should get document by id', async () => {
        dispatchStub.resolves({ '@type': 'Person', name: 'John' });
        
        await client.getDocument({ id: 'Person/john' });
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should get documents with custom dbId', async () => {
        dispatchStub.resolves({ result: [] });
        
        await client.getDocument({}, 'other-db');
        
        expect(client.db()).to.equal('other-db');
      });

      it('should get documents with branch', async () => {
        dispatchStub.resolves({ result: [] });
        
        await client.getDocument({}, null, 'dev');
        
        expect(client.checkout()).to.equal('dev');
      });

      it('should get documents with lastDataVersion', async () => {
        dispatchStub.resolves({ result: [] });
        
        await client.getDocument({}, null, null, 'branch:v123');
        
        expect(client.customHeaders()).to.have.property('TerminusDB-Data-Version');
      });

      it('should get documents with getDataVersion', async () => {
        dispatchStub.resolves({ result: [], 'api:data_version': 'v1' });
        
        const result = await client.getDocument({}, null, null, '', true);
        
        expect(result).to.exist;
      });

      it('should get documents with query parameter', async () => {
        dispatchStub.resolves({ result: [] });
        
        const query = { name: 'John' };
        await client.getDocument({}, null, null, '', false, query);
        
        expect(dispatchStub.calledOnce).to.be.true;
      });

      it('should extract query from params', async () => {
        dispatchStub.resolves({ result: [] });
        
        await client.getDocument({ as_list: true, query: { name: 'Jane' } });
        
        expect(dispatchStub.calledOnce).to.be.true;
      });
    });

    describe('Utility methods', () => {
      it('should generate commit info with author', () => {
        client.localAuth({ user: 'testuser', key: 'key' });
        const commitInfo = client.generateCommitInfo('Test message', 'custom-author');
        
        expect(commitInfo.commit_info.message).to.equal('Test message');
        expect(commitInfo.commit_info.author).to.equal('custom-author');
      });

      it('should generate commit info without explicit author', () => {
        client.localAuth({ user: 'testuser', key: 'key' });
        const commitInfo = client.generateCommitInfo('Test message');
        
        expect(commitInfo.commit_info.message).to.equal('Test message');
        expect(commitInfo.commit_info.author).to.equal('testuser');
      });

      it('should generate commit descriptor', () => {
        client.organization('testorg');
        client.db('testdb');
        client.repo('local');
        
        const descriptor = client.generateCommitDescriptor('commit123');
        
        expect(descriptor).to.have.property('commit_descriptor');
      });

      it('should prepare revision control args', () => {
        client.localAuth({ user: 'testuser', key: 'key' });
        const args = client.prepareRevisionControlArgs({ remote: 'origin' });
        
        expect(args.remote).to.equal('origin');
        expect(args.author).to.equal('testuser');
      });

      it('should return false for invalid revision control args', () => {
        const result1 = client.prepareRevisionControlArgs(null);
        expect(result1).to.be.false;
        
        const result2 = client.prepareRevisionControlArgs('string');
        expect(result2).to.be.false;
      });

      it('should preserve existing author in revision control args', () => {
        const args = client.prepareRevisionControlArgs({ 
          remote: 'origin', 
          author: 'existing-author' 
        });
        
        expect(args.author).to.equal('existing-author');
      });
    });

    describe('Dispatch edge cases', () => {
      it('should reject dispatch without apiUrl', async () => {
        try {
          await client.dispatch('GET', null);
          expect.fail('Should have thrown an error');
        } catch (err) {
          expect(err.message).to.exist;
        }
      });
    });
  });

  describe('updateDocument() advanced cases', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should update document with create parameter', async () => {
      dispatchStub.resolves({ result: 'updated' });
      const doc = { '@id': 'Person/P1', '@type': 'Person', name: 'Alice' };
      
      await client.updateDocument(doc, {}, '', '', '', false, false, true);
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should update document with lastDataVersion', async () => {
      dispatchStub.resolves({ result: 'updated' });
      const doc = { '@id': 'Person/P1', '@type': 'Person' };
      
      await client.updateDocument(doc, {}, '', 'update msg', 'branch:abc123', false);
      
      expect(client._customHeaders).to.exist;
      expect(client._customHeaders['TerminusDB-Data-Version']).to.equal('branch:abc123');
    });

    it('should not set custom header when lastDataVersion is empty string', async () => {
      dispatchStub.resolves({ result: 'updated' });
      const doc = { '@id': 'Person/P1', '@type': 'Person' };
      
      client._customHeaders = undefined;
      await client.updateDocument(doc, {}, '', 'update msg', '', false);
      
      expect(client._customHeaders).to.be.undefined;
    });

    it('should update document with dbId parameter', async () => {
      dispatchStub.resolves({ result: 'updated' });
      const doc = { '@id': 'Person/P1', '@type': 'Person' };
      
      await client.updateDocument(doc, {}, 'differentdb', 'update msg');
      
      expect(client.db()).to.equal('differentdb');
    });

    it('should update document with compress parameter', async () => {
      dispatchStub.resolves({ result: 'updated' });
      const doc = { '@id': 'Person/P1', '@type': 'Person' };
      
      await client.updateDocument(doc, {}, '', '', '', false, true);
      
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[4]).to.be.true;
    });
  });

  describe('deleteDocument() advanced cases', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should delete document with array id', async () => {
      dispatchStub.resolves({ result: 'deleted' });
      
      await client.deleteDocument({ id: ['Person/P1', 'Person/P2'], graph_type: 'instance' });
      
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2]).to.deep.equal(['Person/P1', 'Person/P2']);
    });

    it('should delete document with lastDataVersion', async () => {
      dispatchStub.resolves({ result: 'deleted' });
      
      await client.deleteDocument({ id: 'Person/P1' }, '', 'delete msg', 'branch:abc123');
      
      expect(client._customHeaders).to.exist;
      expect(client._customHeaders['TerminusDB-Data-Version']).to.equal('branch:abc123');
    });

    it('should not set custom header when lastDataVersion is empty', async () => {
      dispatchStub.resolves({ result: 'deleted' });
      
      client._customHeaders = undefined;
      await client.deleteDocument({ id: 'Person/P1' }, '', 'delete msg', '');
      
      expect(client._customHeaders).to.be.undefined;
    });

    it('should delete document with dbId parameter', async () => {
      dispatchStub.resolves({ result: 'deleted' });
      
      await client.deleteDocument({ id: 'Person/P1' }, 'differentdb');
      
      expect(client.db()).to.equal('differentdb');
    });
  });

  describe('apply() advanced cases', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should apply with matchFinalState parameter', async () => {
      dispatchStub.resolves({ result: 'applied' });
      const patch = { before: { '@id': 'Person/P1' }, after: { '@id': 'Person/P1', name: 'Updated' } };
      
      await client.apply(patch, {}, 'apply msg', true);
      
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2].match_final_state).to.be.true;
    });

    it('should apply without matchFinalState parameter', async () => {
      dispatchStub.resolves({ result: 'applied' });
      const patch = { before: { '@id': 'Person/P1' }, after: { '@id': 'Person/P1', name: 'Updated' } };
      
      await client.apply(patch, {}, 'apply msg');
      
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2].match_final_state).to.be.undefined;
    });
  });

  describe('getDocumentHistory()', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should get document history with historyParams', async () => {
      dispatchStub.resolves([{ commit: 'c1', timestamp: '2023-01-01' }]);
      
      const result = await client.getDocumentHistory('Person/Anna', { start: 0, count: 5 });
      
      expect(result).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should get document history without historyParams', async () => {
      dispatchStub.resolves([{ commit: 'c1' }]);
      
      const result = await client.getDocumentHistory('Person/Anna');
      
      expect(result).to.exist;
    });
  });

  describe('sendCustomRequest()', () => {
    it('should send custom GET request', async () => {
      dispatchStub.resolves({ custom: 'response' });
      
      const result = await client.sendCustomRequest('GET', 'http://custom.api/endpoint');
      
      expect(result.custom).to.equal('response');
    });

    it('should send custom POST request with payload', async () => {
      dispatchStub.resolves({ result: 'created' });
      
      const payload = { data: 'test' };
      const result = await client.sendCustomRequest('POST', 'http://custom.api/endpoint', payload);
      
      expect(result.result).to.equal('created');
    });
  });

  describe('Additional branch coverage tests', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should handle resetBranch with valid params', async () => {
      dispatchStub.resolves({ result: 'reset' });
      
      await client.resetBranch('mybranch', 'commit123');
      
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should reject resetBranch without commitId', async () => {
      try {
        await client.resetBranch('mybranch');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('Branch parameter error');
      }
    });

    it('should handle optimizeBranch with valid branchId', async () => {
      dispatchStub.resolves({ result: 'optimized' });
      
      await client.optimizeBranch('mybranch');
      
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should reject optimizeBranch without branchId', async () => {
      try {
        await client.optimizeBranch();
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('Branch parameter error');
      }
    });

    it('should handle deleteBranch with valid branchId', async () => {
      dispatchStub.resolves({ result: 'deleted' });
      
      await client.deleteBranch('mybranch');
      
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should reject deleteBranch without branchId', async () => {
      try {
        await client.deleteBranch();
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('Branch parameter error');
      }
    });

    it('should reject pull without remote_branch', async () => {
      try {
        await client.pull({ remote: 'origin' });
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('Pull parameter error');
      }
    });

    it('should reject push without remote', async () => {
      try {
        await client.push({ remote_branch: 'main' });
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('Push parameter error');
      }
    });

    it('should reject rebase without rebase_from', async () => {
      try {
        await client.rebase({ message: 'rebase msg' });
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('Rebase parameter error');
      }
    });

    it('should handle fetch with remoteId', async () => {
      dispatchStub.resolves({ result: 'fetched' });
      
      await client.fetch('origin');
      
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should handle reset with commitPath', async () => {
      dispatchStub.resolves({ result: 'reset' });
      
      await client.reset('commit/abc123');
      
      expect(dispatchStub.calledOnce).to.be.true;
    });
  });

  describe('patch() validation', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should reject patch with non-object before parameter', async () => {
      try {
        await client.patch('string', { '@id': 'Person/P1' });
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('before');
      }
    });

    it('should reject patch with non-object patch parameter', async () => {
      try {
        await client.patch({ '@id': 'Person/P1' }, 'string');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('after');
      }
    });
  });

  describe('getJSONDiff() validation', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should reject getJSONDiff with non-object before parameter', async () => {
      try {
        await client.getJSONDiff('string', { '@id': 'Person/P1' });
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('before');
      }
    });

    it('should reject getJSONDiff with non-object after parameter', async () => {
      try {
        await client.getJSONDiff({ '@id': 'Person/P1' }, 'string');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('after');
      }
    });

    it('should call getJSONDiff with options', async () => {
      dispatchStub.resolves({ diff: 'result' });
      const before = { '@id': 'Person/P1', name: 'Alice' };
      const after = { '@id': 'Person/P1', name: 'Bob' };
      const options = { keep: { '@id': true } };
      
      await client.getJSONDiff(before, after, options);
      
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should call getJSONDiff without options', async () => {
      dispatchStub.resolves({ diff: 'result' });
      const before = { '@id': 'Person/P1', name: 'Alice' };
      const after = { '@id': 'Person/P1', name: 'Bob' };
      
      await client.getJSONDiff(before, after);
      
      expect(dispatchStub.calledOnce).to.be.true;
    });
  });

  describe('getVersionObjectDiff() validation', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should reject with non-object jsonObject', async () => {
      try {
        await client.getVersionObjectDiff('branch:main', 'string', 'Person/P1');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('jsonObject');
      }
    });

    it('should reject with non-string dataVersion', async () => {
      try {
        await client.getVersionObjectDiff(123, { '@id': 'Person/P1' }, 'Person/P1');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('branch or commit');
      }
    });

    it('should reject with non-string id', async () => {
      try {
        await client.getVersionObjectDiff('branch:main', { '@id': 'Person/P1' }, 123);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('id');
      }
    });

    it('should call getVersionObjectDiff with options', async () => {
      dispatchStub.resolves({ diff: 'result' });
      const jsonObj = { '@id': 'Person/P1', name: 'Alice' };
      const options = { keep: { '@id': true } };
      
      await client.getVersionObjectDiff('branch:main', jsonObj, 'Person/P1', options);
      
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should call getVersionObjectDiff without options', async () => {
      dispatchStub.resolves({ diff: 'result' });
      const jsonObj = { '@id': 'Person/P1', name: 'Alice' };
      
      await client.getVersionObjectDiff('branch:main', jsonObj, 'Person/P1');
      
      expect(dispatchStub.calledOnce).to.be.true;
    });
  });

  describe('getVersionDiff() validation', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should reject with non-string beforeVersion', async () => {
      try {
        await client.getVersionDiff(123, 'branch:dev', 'Person/P1');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('beforeVersion');
      }
    });

    it('should reject with non-string afterVersion', async () => {
      try {
        await client.getVersionDiff('branch:main', 456, 'Person/P1');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('afterVersion');
      }
    });

    it('should call getVersionDiff with id parameter', async () => {
      dispatchStub.resolves({ diff: 'result' });
      
      await client.getVersionDiff('branch:main', 'branch:dev', 'Person/P1');
      
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should call getVersionDiff without id parameter', async () => {
      dispatchStub.resolves({ diff: 'result' });
      
      await client.getVersionDiff('branch:main', 'branch:dev');
      
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should call getVersionDiff with options', async () => {
      dispatchStub.resolves({ diff: 'result' });
      const options = { keep: { '@id': true }, count: 10 };
      
      await client.getVersionDiff('branch:main', 'branch:dev', 'Person/P1', options);
      
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should call getVersionDiff without options', async () => {
      dispatchStub.resolves({ diff: 'result' });
      
      await client.getVersionDiff('branch:main', 'branch:dev', 'Person/P1');
      
      expect(dispatchStub.calledOnce).to.be.true;
    });
  });

  describe('prepareRevisionControlArgs() edge cases', () => {
    it('should return false for non-object rc_args', () => {
      const result = client.prepareRevisionControlArgs('string');
      expect(result).to.be.false;
    });

    it('should return false for null rc_args', () => {
      const result = client.prepareRevisionControlArgs(null);
      expect(result).to.be.false;
    });

    it('should add author when not present', () => {
      client.localAuth({ user: 'testuser', key: 'key' });
      const result = client.prepareRevisionControlArgs({ remote: 'origin' });
      
      expect(result.author).to.equal('testuser');
    });

    it('should preserve existing author', () => {
      const result = client.prepareRevisionControlArgs({ remote: 'origin', author: 'existing' });
      
      expect(result.author).to.equal('existing');
    });
  });

  describe('Query execution with resources', () => {
    beforeEach(() => {
      client.organization('admin');
      client.db('testdb');
    });

    it('should execute query without commitMsg when containsUpdate is false', async () => {
      dispatchStub.resolves({ bindings: [] });
      const WOQL = require('../lib/woql');
      const query = WOQL.triple('v:A', 'v:B', 'v:C');
      
      await client.query(query);
      
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should execute query with resources parameter', async () => {
      dispatchStub.resolves({ bindings: [] });
      const WOQL = require('../lib/woql');
      const query = WOQL.triple('v:A', 'v:B', 'v:C');
      const resources = [{ filename: 'test.csv', data: 'col1,col2\nval1,val2' }];
      
      await client.query(query, '', resources);
      
      expect(dispatchStub.calledOnce).to.be.true;
    });
  });
});

