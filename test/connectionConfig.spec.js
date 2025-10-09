const { expect } = require('chai');
const ConnectionConfig = require('../lib/connectionConfig');

describe('ConnectionConfig tests', () => {
  describe('Constructor', () => {
    it('should create config with server URL', () => {
      const config = new ConnectionConfig('http://localhost:6363');
      expect(config.server).to.exist;
    });

    it('should create config with params', () => {
      const config = new ConnectionConfig('http://localhost:6363', {
        user: 'admin',
        organization: 'myorg',
        db: 'mydb',
      });
      expect(config.organizationid).to.equal('myorg');
      expect(config.dbid).to.equal('mydb');
    });

    it('should create config with default_branch_id param', () => {
      const config = new ConnectionConfig('http://localhost:6363', {
        default_branch_id: 'develop',
      });
      expect(config.default_branch_id).to.equal('develop');
      expect(config.branchid).to.equal('develop');
    });

    it('should create config without default_branch_id param', () => {
      const config = new ConnectionConfig('http://localhost:6363');
      expect(config.default_branch_id).to.equal('main');
      expect(config.branchid).to.equal('main');
    });

    it('should append trailing slash to server URL', () => {
      const config = new ConnectionConfig('http://localhost:6363');
      expect(config.server).to.include('/');
    });

    it('should throw error for invalid server URL', () => {
      expect(() => new ConnectionConfig('invalid-url')).to.throw('Invalid Server URL');
    });

    it('should handle https URLs', () => {
      const config = new ConnectionConfig('https://terminusdb.com');
      expect(config.server).to.include('https://');
    });
  });

  describe('copy()', () => {
    it('should copy all connection settings', () => {
      const config = new ConnectionConfig('http://localhost:6363', {
        user: 'admin',
        organization: 'myorg',
        db: 'mydb',
        branch: 'dev',
        ref: 'commit123',
        repo: 'origin',
      });
      
      const copy = config.copy();
      expect(copy.organizationid).to.equal(config.organizationid);
      expect(copy.dbid).to.equal(config.dbid);
      expect(copy.branchid).to.equal(config.branchid);
      expect(copy.refid).to.equal(config.refid);
      expect(copy.repoid).to.equal(config.repoid);
    });
  });

  describe('update()', () => {
    let config;

    beforeEach(() => {
      config = new ConnectionConfig('http://localhost:6363');
    });

    it('should handle undefined params', () => {
      expect(() => config.update()).to.not.throw();
    });

    it('should update organization from organization param', () => {
      config.update({ organization: 'org1' });
      expect(config.organizationid).to.equal('org1');
    });

    it('should update organization from user param when organization is not provided', () => {
      config.update({ user: 'admin' });
      expect(config.organizationid).to.equal('admin');
    });

    it('should update with db param', () => {
      config.update({ db: 'testdb' });
      expect(config.dbid).to.equal('testdb');
    });

    it('should not update db when param is undefined', () => {
      config.dbid = 'existing';
      config.update({ user: 'admin' });
      expect(config.dbid).to.equal('existing');
    });

    it('should update with token param', () => {
      config.update({ token: 'api-token', user: 'admin' });
      expect(config.local_auth).to.exist;
      expect(config.local_auth.type).to.equal('apikey');
    });

    it('should update with jwt param', () => {
      config.update({ jwt: 'jwt-token', user: 'admin' });
      expect(config.local_auth).to.exist;
      expect(config.local_auth.type).to.equal('jwt');
    });

    it('should update with key param (basic auth)', () => {
      config.update({ key: 'mykey', user: 'admin' });
      expect(config.local_auth).to.exist;
    });

    it('should update with only user param', () => {
      config.update({ user: 'admin' });
      expect(config.local_auth).to.exist;
    });

    it('should update branch param', () => {
      config.update({ branch: 'develop' });
      expect(config.branchid).to.equal('develop');
    });

    it('should not update branch when param is undefined', () => {
      config.branchid = 'main';
      config.update({ user: 'admin' });
      expect(config.branchid).to.equal('main');
    });

    it('should update ref param', () => {
      config.update({ ref: 'commit123' });
      expect(config.refid).to.equal('commit123');
    });

    it('should not update ref when param is undefined', () => {
      config.refid = false;
      config.update({ user: 'admin' });
      expect(config.refid).to.equal(false);
    });

    it('should update repo param', () => {
      config.update({ repo: 'origin' });
      expect(config.repoid).to.equal('origin');
    });

    it('should not update repo when param is undefined', () => {
      config.repoid = 'local';
      config.update({ user: 'admin' });
      expect(config.repoid).to.equal('local');
    });
  });

  describe('Getters', () => {
    let config;

    beforeEach(() => {
      config = new ConnectionConfig('http://localhost:6363', {
        user: 'admin',
        organization: 'myorg',
        db: 'mydb',
        branch: 'dev',
        ref: 'commit123',
        repo: 'origin',
      });
    });

    it('should get server URL', () => {
      expect(config.serverURL()).to.include('localhost');
    });

    it('should get API URL', () => {
      const apiUrl = config.apiURL();
      expect(apiUrl).to.include('api/');
    });

    it('should get API info URL', () => {
      const infoUrl = config.apiURLInfo();
      expect(infoUrl).to.include('api/info');
    });

    it('should get db', () => {
      expect(config.db()).to.equal('mydb');
    });

    it('should throw error when getting db without dbid', () => {
      config.dbid = false;
      expect(() => config.db()).to.throw('Invalid database name');
    });

    it('should get branch', () => {
      expect(config.branch()).to.equal('dev');
    });

    it('should get ref', () => {
      expect(config.ref()).to.equal('commit123');
    });

    it('should get organization', () => {
      expect(config.organization()).to.equal('myorg');
    });

    it('should get repo', () => {
      expect(config.repo()).to.equal('origin');
    });

    it('should get local auth when set', () => {
      const auth = config.localAuth();
      expect(auth).to.exist;
    });

    it('should return false when local auth not set', () => {
      config.local_auth = undefined;
      expect(config.localAuth()).to.be.false;
    });

    it('should get local user when auth is set', () => {
      const user = config.localUser();
      expect(user).to.equal('admin');
    });

    it('should return false when local user not set', () => {
      config.local_auth = undefined;
      expect(config.localUser()).to.be.false;
    });

    it('should get user from local auth', () => {
      const user = config.user();
      expect(user).to.equal('admin');
    });

    it('should return false when no user set', () => {
      config.local_auth = undefined;
      expect(config.user()).to.be.false;
    });

    it('should get user from remote JWT auth when not ignoring JWT', () => {
      config.remote_auth = { type: 'jwt', user: 'jwtuser' };
      const user = config.user();
      expect(user).to.equal('jwtuser');
    });

    it('should ignore JWT user when ignoreJwt is true', () => {
      config.remote_auth = { type: 'jwt', user: 'jwtuser' };
      const user = config.user(true);
      expect(user).to.equal('admin');
    });

    it('should get user from local auth when remote is not JWT', () => {
      config.remote_auth = { type: 'apikey', user: 'apiuser' };
      const user = config.user();
      expect(user).to.equal('admin');
    });
  });

  describe('parseServerURL()', () => {
    it('should parse http URL', () => {
      const config = new ConnectionConfig('http://localhost:6363');
      expect(config.server).to.include('http://');
    });

    it('should parse https URL', () => {
      const config = new ConnectionConfig('https://terminusdb.com');
      expect(config.server).to.include('https://');
    });

    it('should throw error for URL without protocol', () => {
      expect(() => new ConnectionConfig('localhost:6363')).to.throw('Invalid Server URL');
    });

    it('should append trailing slash if missing', () => {
      const config = new ConnectionConfig('http://localhost:6363');
      expect(config.server).to.match(/\/$/);
    });

    it('should not double slash', () => {
      const config = new ConnectionConfig('http://localhost:6363/');
      expect(config.server).to.not.match(/\/\/$/);
    });
  });

  describe('serverUrlEncoding()', () => {
    it('should encode organization in URL', () => {
      const config = new ConnectionConfig('http://localhost:6363/myorg');
      expect(config.server).to.exist;
    });

    it('should set baseServer when URL has organization', () => {
      const config = new ConnectionConfig('http://localhost:6363/myorg');
      expect(config.baseServer).to.exist;
    });

    it('should set baseServer to full URL when no organization', () => {
      const config = new ConnectionConfig('http://localhost:6363');
      expect(config.baseServer).to.equal(config.server);
    });

    it('should encode special characters in organization name', () => {
      const config = new ConnectionConfig('http://localhost:6363/my-org');
      expect(config.server).to.exist;
    });
  });

  describe('Setter methods', () => {
    let config;

    beforeEach(() => {
      config = new ConnectionConfig('http://localhost:6363');
    });

    it('should clear cursor', () => {
      config.organizationid = 'myorg';
      config.dbid = 'mydb';
      config.branchid = 'dev';
      config.refid = 'commit123';
      
      config.clearCursor();
      
      expect(config.organizationid).to.be.false;
      expect(config.dbid).to.be.false;
      expect(config.branchid).to.equal('main');
      expect(config.refid).to.be.false;
      expect(config.repoid).to.equal('local');
    });

    it('should set error message', () => {
      config.setError('Test error');
      expect(config.connection_error).to.equal('Test error');
    });

    it('should set organization with default', () => {
      config.setOrganization();
      expect(config.organizationid).to.equal('admin');
    });

    it('should set organization with custom value', () => {
      config.setOrganization('customorg');
      expect(config.organizationid).to.equal('customorg');
    });

    it('should set DB', () => {
      config.setDB('testdb');
      expect(config.dbid).to.equal('testdb');
    });

    it('should set repo', () => {
      config.setRepo('origin');
      expect(config.repoid).to.equal('origin');
    });

    it('should set branch', () => {
      config.setBranch('develop');
      expect(config.branchid).to.equal('develop');
    });

    it('should set branch to default when null', () => {
      config.setBranch();
      expect(config.branchid).to.equal('main');
    });

    it('should set ref', () => {
      config.setRef('commit123');
      expect(config.refid).to.equal('commit123');
    });

    it('should set remote basic auth', () => {
      config.setRemoteBasicAuth('jwt-token', 'user1');
      expect(config.remote_auth).to.exist;
      expect(config.remote_auth.type).to.equal('jwt');
      expect(config.remote_auth.user).to.equal('user1');
    });

    it('should clear remote auth when key is null', () => {
      config.remote_auth = { type: 'jwt', user: 'user1' };
      config.setRemoteBasicAuth();
      expect(config.remote_auth).to.be.undefined;
    });

    it('should set local basic auth with defaults', () => {
      config.setLocalBasicAuth('mykey');
      expect(config.local_auth).to.exist;
      expect(config.local_auth.type).to.equal('basic');
      expect(config.local_auth.user).to.equal('admin');
    });

    it('should set local basic auth with custom type', () => {
      config.setLocalBasicAuth('api-token', 'user1', 'apikey');
      expect(config.local_auth.type).to.equal('apikey');
      expect(config.local_auth.user).to.equal('user1');
    });

    it('should set local auth with credential object', () => {
      const cred = { type: 'jwt', user: 'user1', key: 'token' };
      config.setLocalAuth(cred);
      expect(config.local_auth).to.equal(cred);
    });

    it('should set remote auth with credential object', () => {
      const cred = { type: 'jwt', user: 'user1', key: 'token' };
      config.setRemoteAuth(cred);
      expect(config.remote_auth).to.equal(cred);
    });

    it('should get remote auth when set', () => {
      config.remote_auth = { type: 'jwt', user: 'user1' };
      expect(config.remoteAuth()).to.exist;
    });

    it('should return false when remote auth not set', () => {
      expect(config.remoteAuth()).to.be.false;
    });
  });

  describe('URL generation methods', () => {
    let config;

    beforeEach(() => {
      config = new ConnectionConfig('http://localhost:6363', {
        user: 'admin',
        organization: 'myorg',
        db: 'mydb',
      });
    });

    it('should generate db URL', () => {
      const url = config.dbURL();
      expect(url).to.include('db');
    });

    it('should generate user URL without user param', () => {
      const url = config.userURL();
      expect(url).to.include('user');
    });

    it('should generate user URL with user param', () => {
      const url = config.userURL('testuser');
      expect(url).to.include('testuser');
    });

    it('should generate organization URL without params', () => {
      const url = config.organizationURL();
      expect(url).to.include('organization');
    });

    it('should generate organization URL with orgId', () => {
      const url = config.organizationURL('myorg');
      expect(url).to.include('myorg');
    });

    it('should generate organization URL with orgId and action', () => {
      const url = config.organizationURL('myorg', 'users');
      expect(url).to.include('myorg');
      expect(url).to.include('users');
    });
  });
});
