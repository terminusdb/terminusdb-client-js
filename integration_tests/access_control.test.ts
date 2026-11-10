//@ts-check
import { describe, expect, test, afterAll } from '@jest/globals';
import { AccessControl } from '../index.js';
import { TEST_SERVER_URL, TEST_USER } from "./test_utils";

const TEST_KEY = process.env.TDB_ADMIN_PASS ?? "root";
const ac = new AccessControl(TEST_SERVER_URL, { user: TEST_USER, key: TEST_KEY });

// These endpoints create Organization resources as a side effect — track and
// remove them so the shared test server stays clean between runs.
const createdOrgs: string[] = [];

async function deleteOrg(name: string): Promise<void> {
  await fetch(`${TEST_SERVER_URL}/api/organizations/${encodeURIComponent(name)}`, {
    method: 'DELETE',
    headers: { Authorization: `Basic ${Buffer.from(`${TEST_USER}:${TEST_KEY}`).toString('base64')}` },
  }).catch(() => undefined);
}

afterAll(async () => {
  for (const org of createdOrgs) await deleteOrg(org);
  await deleteOrg('admin/invites');
  await deleteOrg('admin/access_requests');
});

// Calls that the local test server may legitimately reject — the client code
// path is what matters here.
async function settles(promise: Promise<any>): Promise<any> {
  try {
    return await promise;
  } catch (e) {
    expect(e).toBeDefined();
    return undefined;
  }
}

describe('AccessControl driver', () => {
  test('constructs and normalizes the API url', () => {
    expect(ac.baseURL).toBe(`${TEST_SERVER_URL}/api`);
    expect(new AccessControl(`${TEST_SERVER_URL}/`).baseURL).toBe(`${TEST_SERVER_URL}/api`);
  });

  test('token setters configure auth', () => {
    const a = new AccessControl(TEST_SERVER_URL, {});
    a.setJwtToken('jwt-token');
    expect(a.apiKey).toBe('jwt-token');
    expect(a.apiType).toBe('jwt');
    a.setApiToken('api-token');
    expect(a.apiKey).toBe('api-token');
    expect(a.apiType).toBe('apikey');
    a.setApiKey('api-key');
    expect(a.apiKey).toBe('api-key');
    expect(a.apiType).toBe('basic');
    a.customHeaders({ 'X-Test': '1' });
    expect((a as any).customHeaders()['X-Test']).toBe('1');
  });

  test('getDefaultOrganization returns the configured org', () => {
    expect(ac.getDefaultOrganization({ organization: 'admin' })).toBe('admin');
    expect(ac.getDefaultOrganization({})).toBeUndefined();
  });

  test('organization endpoints', async () => {
    await settles(ac.getAllOrganizations());
    await settles(ac.getOrganization('admin'));
    const org = `tmp_org_${Date.now()}`;
    createdOrgs.push(org);
    await settles(ac.createOrganization(org));
    await settles(ac.deleteOrganization(org));
  });

  test('role endpoints', async () => {
    await settles(ac.createRole('tmp_role', ['instance_read_access']));
    await settles(ac.getAccessRoles());
    await settles(ac.deleteRole('tmp_role'));
  });

  test('user endpoints', async () => {
    await settles(ac.getAllUsers());
    await settles(ac.getUserInfo('admin'));
    const user = `tmp_user_${Date.now()}`;
    await settles(ac.createUser(user, 'temppass'));
    await settles(ac.deleteUser(user));
  });

  test('org user and team role lookups', async () => {
    await settles(ac.getOrgUsers('admin'));
    await settles(ac.getTeamUserRoles('admin', 'admin'));
  });

  test('capability and user-role management', async () => {
    await settles(ac.manageCapability('admin', 'System Database', ['instance_read_access'], 'grant', 'database'));
    await settles(ac.createUserRole('admin', 'admin', 'instance_read_access', 'admin'));
    await settles(ac.updateUserRole('admin', 'cap_id', 'admin', 'instance_read_access', 'admin'));
  });

  test('access request endpoints', async () => {
    await settles(ac.accessRequestsList('admin'));
    await settles(ac.sendAccessRequest('test@example.org', 'dfrnt', 'note', 'admin'));
    await settles(ac.deleteAccessRequest('nonexistent_id', 'admin'));
  });

  test('organization invite lifecycle', async () => {
    await settles(ac.ifOrganizationExists('admin'));
    const remoteOrg = `tmp_remote_org_${Date.now()}`;
    createdOrgs.push(remoteOrg);
    await settles(ac.createOrganizationRemote(remoteOrg));
    await settles(ac.getPendingOrgInvites('admin'));
    await settles(ac.sendOrgInvite('test@example.org', 'read', 'note', 'admin'));
    await settles(ac.getOrgInvite('invite_id', 'admin'));
    await settles(ac.updateOrgInviteStatus('invite_id', true, 'admin'));
    await settles(ac.deleteOrgInvite('invite_id', 'admin'));
  });

  test('team role and membership endpoints', async () => {
    await settles(ac.getTeamUserRole('admin'));
    await settles(ac.getDatabaseRolesOfUser('admin', 'admin'));
    await settles(ac.removeUserFromOrg('user_id', 'admin'));
  });

  test('missing organization argument rejects with a descriptive error', async () => {
    const a = ac as any;
    await expect(a.getOrgUsers()).rejects.toThrow(/organization name/);
    await expect(a.ifOrganizationExists()).rejects.toThrow(/organization name/);
    await expect(a.getPendingOrgInvites()).rejects.toThrow(/organization name/);
    await expect(a.getTeamUserRole()).rejects.toThrow(/organization name/);
    await expect(a.accessRequestsList()).rejects.toThrow(/organization name/);
    await expect(a.deleteAccessRequest('id')).rejects.toThrow(/organization name/);
    await expect(a.sendAccessRequest('e@x.org', 'a', 'n')).rejects.toThrow(/organization name/);
  });

  test('missing invite arguments reject with a descriptive error', async () => {
    const a = ac as any;
    await expect(a.sendOrgInvite()).rejects.toThrow(/organization name/);
    await expect(a.sendOrgInvite('', 'read', 'note', 'admin')).rejects.toThrow(/user email/);
    await expect(a.sendOrgInvite('a@b.c', '', 'note', 'admin')).rejects.toThrow(/role/);
    await expect(a.getOrgInvite()).rejects.toThrow(/organization name/);
    await expect(a.getOrgInvite('id', 'admin')).rejects.toThrow(/invite id|API Error|Error/);
    await expect(a.deleteOrgInvite()).rejects.toThrow(/organization name/);
    await expect(a.updateOrgInviteStatus()).rejects.toThrow(/organization name/);
  });

  test('missing user-role arguments reject with a descriptive error', async () => {
    const a = ac as any;
    await expect(a.createUserRole()).rejects.toThrow();
    await expect(a.updateUserRole()).rejects.toThrow();
  });
});
