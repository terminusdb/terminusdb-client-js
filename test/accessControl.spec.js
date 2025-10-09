const { expect } = require('chai');
const sinon = require('sinon');
const AccessControl = require('../lib/accessControl');
const CONST = require('../lib/const');

describe('AccessControl tests', () => {
  let accessControl;
  let dispatchStub;

  beforeEach(() => {
    accessControl = new AccessControl('http://localhost:6363/', {
      user: 'admin',
      organization: 'admin',
      key: 'mykey',
    });
    dispatchStub = sinon.stub(accessControl, 'dispatch');
  });

  afterEach(() => {
    sinon.restore();
  });

  describe('Constructor and initialization', () => {
    it('should create AccessControl without params', () => {
      const ac = new AccessControl('http://localhost:6363');
      expect(ac.baseURL).to.exist;
      expect(ac.apiKey).to.be.undefined;
    });

    it('should create AccessControl with empty params object', () => {
      const ac = new AccessControl('http://localhost:6363', {});
      expect(ac.baseURL).to.exist;
      expect(ac.defaultOrganization).to.be.undefined;
    });

    it('should create AccessControl with basic auth', () => {
      const ac = new AccessControl('http://localhost:6363', {
        user: 'admin',
        key: 'mykey',
        organization: 'myorg',
      });
      expect(ac.apiKey).to.equal('mykey');
      expect(ac.apiType).to.equal('basic');
      expect(ac.user).to.equal('admin');
      expect(ac.defaultOrganization).to.equal('myorg');
    });

    it('should create AccessControl with JWT token', () => {
      const ac = new AccessControl('http://localhost:6363', {
        jwt: 'jwt-token-here',
        organization: 'myorg',
      });
      expect(ac.apiKey).to.equal('jwt-token-here');
      expect(ac.apiType).to.equal('jwt');
    });

    it('should create AccessControl with API token', () => {
      const ac = new AccessControl('http://localhost:6363', {
        token: 'api-token-here',
        organization: 'myorg',
      });
      expect(ac.apiKey).to.equal('api-token-here');
      expect(ac.apiType).to.equal('apikey');
    });

    it('should throw error for invalid URL', () => {
      expect(() => new AccessControl()).to.throw('api url required');
      expect(() => new AccessControl(null)).to.throw('api url required');
    });

    it('should append trailing slash to URL', () => {
      const ac = new AccessControl('http://localhost:6363', {});
      expect(ac.baseURL).to.equal('http://localhost:6363/api');
    });

    it('should handle URL that already has trailing slash', () => {
      const ac = new AccessControl('http://localhost:6363/', {});
      expect(ac.baseURL).to.equal('http://localhost:6363/api');
    });

    it('should handle getDefaultOrganization with non-string organization', () => {
      const ac = new AccessControl('http://localhost:6363', {
        organization: 123,
      });
      expect(ac.defaultOrganization).to.be.undefined;
    });

    it('should handle getDefaultOrganization with no params', () => {
      const ac = new AccessControl('http://localhost:6363');
      expect(ac.defaultOrganization).to.be.undefined;
    });

    it('should handle getDefaultOrganization with null', () => {
      const result = accessControl.getDefaultOrganization(null);
      expect(result).to.be.undefined;
    });
  });

  describe('Token management', () => {
    it('should set JWT token', () => {
      accessControl.setJwtToken('new-jwt-token');
      expect(accessControl.apiKey).to.equal('new-jwt-token');
      expect(accessControl.apiType).to.equal('jwt');
    });

    it('should throw error for empty JWT token', () => {
      expect(() => accessControl.setJwtToken()).to.throw('Access token required');
    });

    it('should set API token', () => {
      accessControl.setApiToken('new-api-token');
      expect(accessControl.apiKey).to.equal('new-api-token');
      expect(accessControl.apiType).to.equal('apikey');
    });

    it('should throw error for empty API token', () => {
      expect(() => accessControl.setApiToken()).to.throw('Access token required');
    });

    it('should set API key for basic auth', () => {
      accessControl.setApiKey('new-key');
      expect(accessControl.apiKey).to.equal('new-key');
      expect(accessControl.apiType).to.equal('basic');
    });

    it('should throw error for empty API key', () => {
      expect(() => accessControl.setApiKey()).to.throw('authentication key required');
    });
  });

  describe('Custom headers', () => {
    it('should set and get custom headers', () => {
      const customHeaders = { 'Custom-header-01': 'test-headers', 'Custom-header-02': 'test' };
      accessControl.customHeaders(customHeaders);
      expect(accessControl.customHeaders()).to.eql(customHeaders);
    });

    it('should return undefined when no custom headers set', () => {
      const ac = new AccessControl('http://localhost:6363', { key: 'test' });
      expect(ac.customHeaders()).to.be.undefined;
    });

    it('should update custom headers', () => {
      accessControl.customHeaders({ 'Header-1': 'value1' });
      accessControl.customHeaders({ 'Header-2': 'value2' });
      expect(accessControl.customHeaders()).to.eql({ 'Header-2': 'value2' });
    });
  });

  describe('Organization operations', () => {
    it('should get organization', async () => {
      dispatchStub.resolves({ name: 'testorg' });
      const result = await accessControl.getOrganization('testorg');
      expect(result).to.exist;
      expect(dispatchStub.calledOnce).to.be.true;
    });

    it('should get all organizations', async () => {
      dispatchStub.resolves([{ name: 'org1' }]);
      const result = await accessControl.getAllOrganizations();
      expect(result).to.exist;
    });

    it('should create organization', async () => {
      dispatchStub.resolves({ result: 'created' });
      const result = await accessControl.createOrganization('neworg');
      expect(result).to.exist;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[1]).to.equal(CONST.POST);
    });

    it('should delete organization', async () => {
      dispatchStub.resolves({ result: 'deleted' });
      const result = await accessControl.deleteOrganization('oldorg');
      expect(result).to.exist;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[1]).to.equal(CONST.DELETE);
    });
  });

  describe('Role management', () => {
    it('should create role', async () => {
      dispatchStub.resolves({ result: 'created' });
      const result = await accessControl.createRole('Reader', ['INSTANCE_READ_ACCESS']);
      expect(result).to.exist;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2].name).to.equal('Reader');
    });

    it('should delete role', async () => {
      dispatchStub.resolves({ result: 'deleted' });
      const result = await accessControl.deleteRole('Reader');
      expect(result).to.exist;
    });

    it('should get access roles', async () => {
      dispatchStub.resolves([{ name: 'admin' }]);
      const result = await accessControl.getAccessRoles();
      expect(result).to.exist;
    });
  });

  describe('User management', () => {
    it('should get all users', async () => {
      dispatchStub.resolves([{ name: 'user1' }]);
      const result = await accessControl.getAllUsers();
      expect(result).to.exist;
    });

    it('should create user', async () => {
      dispatchStub.resolves({ result: 'created' });
      const result = await accessControl.createUser('newuser', 'password123');
      expect(result).to.exist;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2].name).to.equal('newuser');
    });

    it('should delete user', async () => {
      dispatchStub.resolves({ result: 'deleted' });
      const result = await accessControl.deleteUser('User/olduser');
      expect(result).to.exist;
    });

    it('should manage capability', async () => {
      dispatchStub.resolves({ result: 'granted' });
      const result = await accessControl.manageCapability(
        'user1',
        'resource1',
        ['reader'],
        'grant',
        'organization',
      );
      expect(result).to.exist;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2].operation).to.equal('grant');
    });
  });

  describe('Organization users', () => {
    it('should get organization users', async () => {
      dispatchStub.resolves([{ user: 'user1' }]);
      const result = await accessControl.getOrgUsers();
      expect(result).to.exist;
    });

    it('should reject getOrgUsers without organization', async () => {
      const ac = new AccessControl('http://localhost:6363', { key: 'test' });
      try {
        await ac.getOrgUsers();
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('organization name');
      }
    });

    it('should get team user roles', async () => {
      dispatchStub.resolves({ user: 'user1', roles: ['reader'] });
      const result = await accessControl.getTeamUserRoles('user1');
      expect(result).to.exist;
    });

    it('should get team user role', async () => {
      dispatchStub.resolves({ userRole: 'Role/admin' });
      const result = await accessControl.getTeamUserRole();
      expect(result).to.exist;
    });

    it('should get team user roles with orgName', async () => {
      dispatchStub.resolves({ capability: [] });
      const result = await accessControl.getTeamUserRoles('user1', 'myorg');
      expect(result).to.exist;
    });

    it('should get team user roles with default org', async () => {
      dispatchStub.resolves({ capability: [] });
      const result = await accessControl.getTeamUserRoles('user1');
      expect(result).to.exist;
    });

    it('should reject getTeamUserRoles without organization', async () => {
      const ac = new AccessControl('http://localhost:6363', { key: 'test' });
      try {
        await ac.getTeamUserRoles('user1');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('organization name');
      }
    });
  });

  describe('Invitation management', () => {
    it('should get pending invites', async () => {
      dispatchStub.resolves([{ email_to: 'user@test.com' }]);
      const result = await accessControl.getPendingOrgInvites();
      expect(result).to.exist;
    });

    it('should reject getPendingOrgInvites without organization', async () => {
      const ac = new AccessControl('http://localhost:6363', { key: 'test' });
      try {
        await ac.getPendingOrgInvites();
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('organization name');
      }
    });

    it('should send org invite', async () => {
      dispatchStub.resolves({ result: 'sent' });
      const result = await accessControl.sendOrgInvite('user@test.com', 'Role/reader', 'Welcome');
      expect(result).to.exist;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2].email_to).to.equal('user@test.com');
    });

    it('should reject sendOrgInvite without email', async () => {
      try {
        await accessControl.sendOrgInvite(null, 'Role/reader');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('user email');
      }
    });

    it('should reject sendOrgInvite without role', async () => {
      try {
        await accessControl.sendOrgInvite('user@test.com', null);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('role');
      }
    });

    it('should reject sendOrgInvite without organization', async () => {
      const ac = new AccessControl('http://localhost:6363', { key: 'test' });
      try {
        await ac.sendOrgInvite('user@test.com', 'Role/reader');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('organization name');
      }
    });

    it('should get org invite', async () => {
      dispatchStub.resolves({ id: 'invite123' });
      const result = await accessControl.getOrgInvite('Invitation/abc123');
      expect(result).to.exist;
    });

    it('should reject getOrgInvite without organization', async () => {
      const ac = new AccessControl('http://localhost:6363', { key: 'test' });
      try {
        await ac.getOrgInvite('Invitation/abc123');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('organization name');
      }
    });

    it('should reject getOrgInvite without inviteId', async () => {
      try {
        await accessControl.getOrgInvite(null);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('invite id');
      }
    });

    it('should delete org invite', async () => {
      dispatchStub.resolves({ result: 'deleted' });
      const result = await accessControl.deleteOrgInvite('Invitation/abc123');
      expect(result).to.exist;
    });

    it('should reject deleteOrgInvite without organization', async () => {
      const ac = new AccessControl('http://localhost:6363', { key: 'test' });
      try {
        await ac.deleteOrgInvite('Invitation/abc123');
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('organization name');
      }
    });

    it('should reject deleteOrgInvite without inviteId', async () => {
      try {
        await accessControl.deleteOrgInvite(null);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('invite id');
      }
    });

    it('should update invite status', async () => {
      dispatchStub.resolves({ result: 'updated' });
      const result = await accessControl.updateOrgInviteStatus('Invitation/abc123', true);
      expect(result).to.exist;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2].accepted).to.be.true;
    });
  });

  describe('User-organization operations', () => {
    it('should remove user from org', async () => {
      dispatchStub.resolves({ result: 'removed' });
      const result = await accessControl.removeUserFromOrg('User/user123');
      expect(result).to.exist;
    });

    it('should get database roles of user', async () => {
      dispatchStub.resolves([{ database: 'db1', role: 'reader' }]);
      const result = await accessControl.getDatabaseRolesOfUser('User/user123');
      expect(result).to.exist;
    });

    it('should create user role', async () => {
      dispatchStub.resolves({ result: 'created' });
      const result = await accessControl.createUserRole(
        'User/user123',
        'Database/db1',
        'Role/reader',
      );
      expect(result).to.exist;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2].scope).to.equal('Database/db1');
    });

    it('should update user role', async () => {
      dispatchStub.resolves({ result: 'updated' });
      const result = await accessControl.updateUserRole(
        'User/user123',
        'Capability/cap123',
        'Database/db1',
        'Role/writer',
      );
      expect(result).to.exist;
    });
  });

  describe('Access requests', () => {
    it('should get access requests list', async () => {
      dispatchStub.resolves([{ email: 'user@test.com' }]);
      const result = await accessControl.accessRequestsList();
      expect(result).to.exist;
    });

    it('should send access request', async () => {
      dispatchStub.resolves({ result: 'sent' });
      const result = await accessControl.sendAccessRequest(
        'user@test.com',
        'My Company',
        'Please add me',
      );
      expect(result).to.exist;
    });

    it('should delete access request', async () => {
      dispatchStub.resolves({ result: 'deleted' });
      const result = await accessControl.deleteAccessRequest('req123');
      expect(result).to.exist;
    });
  });

  describe('User info', () => {
    it('should get user info', async () => {
      dispatchStub.resolves({ name: 'user1', email: 'user@test.com' });
      const result = await accessControl.getUserInfo();
      expect(result).to.exist;
    });

    it('should get specific user info', async () => {
      dispatchStub.resolves({ name: 'user2' });
      const result = await accessControl.getUserInfo('user2');
      expect(result).to.exist;
    });
  });

  describe('Organization existence and remote operations', () => {
    it('should check if organization exists', async () => {
      dispatchStub.resolves({ status: 200 });
      const result = await accessControl.ifOrganizationExists('myorg');
      expect(result).to.exist;
    });

    it('should reject ifOrganizationExists without orgName', async () => {
      try {
        await accessControl.ifOrganizationExists();
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('organization name');
      }
    });

    it('should reject ifOrganizationExists with null orgName', async () => {
      try {
        await accessControl.ifOrganizationExists(null);
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('organization name');
      }
    });

    it('should create organization remote', async () => {
      dispatchStub.resolves({ result: 'created' });
      const result = await accessControl.createOrganizationRemote('neworg');
      expect(result).to.exist;
      const callArgs = dispatchStub.firstCall.args;
      expect(callArgs[2].organization).to.equal('neworg');
    });
  });

  describe('Dispatch error handling', () => {
    it('should reject dispatch without URL', async () => {
      // Restore the stub so we test the real dispatch method
      dispatchStub.restore();
      
      try {
        await accessControl.dispatch(null, CONST.GET, {});
        expect.fail('Should have thrown an error');
      } catch (err) {
        expect(err.message).to.include('Invalid request URL');
      }
    });
  });
});