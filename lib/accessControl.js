const DispatchRequest = require('./dispatchRequest');
const ErrorMessage = require('./errorMessage');
const CONST = require('./const');
const UTILS = require('./utils');
// eslint-disable-next-line no-unused-vars
const typedef = require('./typedef');
/**
 * @license Apache Version 2
 * @module AccessControl
 * @constructor AccessControl
 * @description The AccessControl object has various methods to control the access for users.
 * for the credential you can use the JWT token or the API token
 * @example
 * //connect with the API token
 * //(to request a token create an account in  https://terminusdb.com/)
 * const accessContol = new AccessControl("https://servername.com",
 * {organization:"my_team_name",
 * token:"dGVybWludXNkYjovLy9kYXRhL2tleXNfYXB........"})
 * accessControl.getOrgUsers().then(result=>{
 *      console.log(result)
 * })
 *
 * //connect with the jwt token this type of connection is only for the dashboard
 * //or for application integrate with our login workflow
 * const accessContol = new AccessControl("https://servername.com",
 * {organization:"my_team_name",
 * jwt:"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkpXUjBIOXYyeTFORUd........"})
 * accessControl.getOrgUsers().then(result=>{
 *      console.log(result)
 * })
 *
 * //if the jwt is expired you can change it with
 * accessControl.setJwtToken("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkpXUjBIOXYy
 * eTFORUd.......")
 *
 * //connect with the base authentication this type of connection is only for the local installation
 * const accessContol = new AccessControl("http://localhost:6363",
 * {organization:"my_team_name", user:"admin"
 * key:"mykey"})
 * accessControl.getOrgUsers().then(result=>{
 *     console.log(result)
 * })
 *
 */

function AccessControl(cloudAPIUrl, params) {
  this.baseURL = this.getAPIUrl(cloudAPIUrl);
  if (!params) return;
  if (params.jwt) {
    this.setJwtToken(params.jwt);
  } else if (params.token) {
    this.setApiToken(params.token);
  } else if (params.key) {
    this.setApiKey(params.key);
    this.user = params.user;
  }
  this.defaultOrganization = this.getDefaultOrganization(params);
}

/**
 * Get a organization from parameters.
 * @param {object} params -  The parameters
 * @return {string|undefined} - organization
 */
AccessControl.prototype.getDefaultOrganization = function (params) {
  if (params && params.organization && typeof params.organization === 'string') {
    return params.organization;
  }
  return undefined;
};
/**
 * Sets the Jwt token for the object
 * @param {string} jwt -  The jwt api token to use
 */
AccessControl.prototype.setJwtToken = function (jwt) {
  if (!jwt) {
    throw new Error('TerminusX Access token required');
  }

  this.apiKey = jwt;
  this.apiType = 'jwt';
};

/**
 * Sets the API token for the object, to request a token create an account in  https://terminusdb.com/
 * @param {string} atokenpi  -  The API token to use to connect with TerminusX
 */
AccessControl.prototype.setApiToken = function (token) {
  if (!token) {
    throw new Error('TerminusX Access token required');
  }

  this.apiKey = token;
  this.apiType = 'apikey';
};

/**
 * Sets the API token for the object, to request a token create an account in  https://terminusdb.com/
 * @param {string} atokenpi  -  The API token to use to connect with TerminusX
 */
AccessControl.prototype.setApiKey = function (key) {
  if (!key) {
    throw new Error('TerminusDB bacis authentication key required');
  }

  this.apiKey = key;
  this.apiType = 'basic';
};

/**
 * Get a API url from cloudAPIUrl
 * @param {string} cloudAPIUrl -  The base url for cloud
 * @return {string} apiUrl
 */
AccessControl.prototype.getAPIUrl = function (cloudAPIUrl) {
  if (!cloudAPIUrl || typeof cloudAPIUrl !== 'string') {
    throw new Error('TerminusX api url required!');
  }
  if (cloudAPIUrl.lastIndexOf('/') !== cloudAPIUrl.length - 1) {
    // eslint-disable-next-line no-param-reassign
    cloudAPIUrl += '/'; // always append slash to ensure regularity
  }
  return `${cloudAPIUrl}api`;
};

AccessControl.prototype.dispatch = function (requestUrl, action, payload) {
  if (!requestUrl) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          action,
          'Invalid request URL',
        ),
      ),
    );
  }
  return DispatchRequest(
    requestUrl,
    action,
    payload,
    { type: this.apiType, key: this.apiKey, user: this.user },
  );
};

/**
 * -- TerminusDB API ---
 * This end point works in basic authentication, admin user
 * Get list of organizations
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 */

AccessControl.prototype.getAllOrganizations = function () {
  return this.dispatch(`${this.baseURL}/organizations`, CONST.GET);
};

/**
 * -- TerminusDB API ---
 * This end point works in basic authentication, admin user
 * Create an organization
 * @param {string} orgName -  The organization name to create
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.createOrganization("my_org_name").then(result=>{
 *      console.log(result)
 * })
 */
AccessControl.prototype.createOrganization = function (orgName) {
  // maybe we have to review this
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(orgName)}`, CONST.POST, {});
};

/**
 * -- TerminusDB API ---
 * Delete an Organization
 * @param {string} orgName -  The organization name to delete
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.createOrganization("my_org_name").then(result=>{
 *      console.log(result)
 * })
 */
AccessControl.prototype.deleteOrganization = function (orgName) {
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(orgName)}`, CONST.DELETE);
};

/**
 * --TerminusDB API ---
 * basic authentication, admin user.
 * Create a new role in the system database.
 * @param {string} [name] -  The role name.
 * @param {typedef.RolesActions} [actions] - A list of actions
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.createRole("Reader",[ACTIONS.INSTANCE_READ_ACCESS]).then(result=>{
 *  console.log(result)
 * })
 *
 */
AccessControl.prototype.createRole = function (name, actions) {
  const payload = { name, action: actions };
  return this.dispatch(`${this.baseURL}/roles`, CONST.POST, payload);
};

/**
 * -- TerminusdDB API ---
 * basic Authentication, admin user.
 * Delete role in the system database, (this api is enabled only in the local installation)
 * @param {string} [name] -  The role name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.deleteRole("Reader").then(result=>{
 *  console.log(result)
 * })
 *
 */
 AccessControl.prototype.deleteRole = function (name) {
  return this.dispatch(`${this.baseURL}/roles/${UTILS.encodeURISegment(name)}`, CONST.DELETE);
};

/**
 * -- TerminusdDB API ---
 * basic Authentication, admin user.
 * Return the list of all the users (this api is enabled only in the local installation)
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.getAllUsers().then(result=>{
 *  console.log(result)
 * })
 *
 */

AccessControl.prototype.getAllUsers = function () {
  return this.dispatch(`${this.baseURL}/users`, CONST.GET);
};

/**
 * -- TerminusdDB API ---
 * basic Authentication, admin user.
 * Add the user into the system database
 * @param  {string}  name - the user name
 * @param  {string}  [password] - you need the password for basic authentication
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.deleteUser(userId).then(result=>{
 *  console.log(result)
 * })
 *
 */

AccessControl.prototype.createUser = function (name, password) {
  const payload = { name, password };
  return this.dispatch(`${this.baseURL}/users`, CONST.POST, payload);
};

/**
 * -- TerminusdDB API ---
 * basic Authentication, admin user.
 * Remove the user from the system database.
 * @param  {string}  userId - the document user id
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.deleteUser(userId).then(result=>{
 *  console.log(result)
 * })
 *
 */

AccessControl.prototype.deleteUser = function (userId) {
  return this.dispatch(`${this.baseURL}/users/${UTILS.encodeURISegment(userId)}`, CONST.DELETE);
};

/**
 * -- TerminusdDB API ---
 * Grant/Revoke Capability
 * @param  {string}  userId - the document user id
 * @param  {string}  resourceId - the resource id (database or team)
 * @param  {array}   rolesArr - the roles list
 * @param  {typedef.CapabilityCommand}  operation - grant/revoke operation
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 { "operation" : "grant",
  "scope" : "Organization/myteam",
  "user" : "User/myUser",
  "roles" : ["Role/reader"] }
 */
AccessControl.prototype.manageCapability = function (userId, resourceId, rolesArr, operation) {
  const payload = {
    operation, user: userId, roles: rolesArr, scope: resourceId,
  };
  return this.dispatch(`${this.baseURL}/capabilities`, CONST.POST, payload);
};

/**
 * --TerminusX and TerminusDB API ---
 * Get all the system database roles types.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 */
AccessControl.prototype.getAccessRoles = function () {
  return this.dispatch(`${this.baseURL}/roles`, CONST.GET);
};

/**
 * -- TerminusX and TerminusDB API --
 * Get all the organization's users and roles,
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.getOrgUsers().then(result=>{
 *  console.log(result)
 * })
 *
 * //this function will return an array of capabilities with users and roles
 * //-- TerminusX --  response array example
 * //[{capability: "Capability/3ea26e1d698821c570afe9cb4fe81a3......"
 * //     email: {@type: "xsd:string", @value: "user@terminusdb.com"}
 * //     picture: {@type: "xsd:string",…}
 * //     role: "Role/dataReader"
 * //     scope: "Organization/my_org_name"
 * //     user: "User/auth0%7C613f5dnndjdjkTTT"}]
 * //
 * //
 * // -- Local Installation -- response array example
 * //[{ "@id":"User/auth0%7C615462f8ab33f4006a6bee0c",
 * //  "capability": [{
 * //   "@id":"Capability/c52af34b71f6f8916ac0115ecb5fe0e31248ead8b1e3d100852015...",
 * //   "@type":"Capability",
 * //  "role": [{
 * //    "@id":"Role/admin",
 * //    "@type":"Role",
 * //    "action": ["instance_read_access"],
 * //     "name":"Admin Role"
 * //     }],
 * //  "scope":"Organization/@team"}]]
 */

AccessControl.prototype.getOrgUsers = function (orgName) {
  if (!orgName && !this.defaultOrganization) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'GET',
          'Please provide a organization name',
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/users`, CONST.GET);
};

/**
 * -- TerminusX and TerminusDB API --
 * Get the user roles for a given organization or the default organization,
 * @param {string} [userName] -  The organization name.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.getTeamUserRole("myUser").then(result=>{
 *  console.log(result)
 * })
 *
 * //response object example
 * {
 *  "@id": "User/myUser",
 *   "capability": [
 *         {
 *           "@id":"Capability/server_access",
 *           "@type":"Capability",
 *           "role": [{
 *              "@id":"Role/reader",
 *               "@type":"Role",
 *              "action": [
 *                 "instance_read_access",
 *              ],
 *               "name":"reader"
 *             }],
 *           "scope":"Organization/myteam"
 *         }
 *       ],
 *   "name": "myUser"
 *}
 */

AccessControl.prototype.getTeamUserRoles = function (userName, orgName) {
  if (!orgName && !this.defaultOrganization) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'GET',
          'Please provide a organization name',
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/users/${UTILS.encodeURISegment(userName)}`, CONST.GET);
};

/**
 * -- TerminusX API ---
 * Check if the organization exists. it is a Head call .
 * IMPORTANT This does not work with the API-TOKEN.
 * @param {string} orgName -  The organization name to check if exists.
 * @return {Promise} A promise that returns the call status object,  200: if the organization
 * exists and 404: if the organization does not exist
 */
AccessControl.prototype.ifOrganizationExists = function (orgName) {
  if (!orgName) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'HEAD',
          'Please provide a organization name',
        ),
      ),
    );
  }

  return this.dispatch(`${this.baseURL}/private/organizations/${UTILS.encodeURISegment(orgName)}`, CONST.HEAD);
};

/**
 * -- TerminusX API ---
 * Get the pending invitations list.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * const invitationList = accessControl.getPendingOrgInvites().then(result=>{
 *    console.log(invitationList)
 *
 * })
 * //this will return an array of invitations object like this
 * //[{@id: "Organization/my_team_name/invitations/Invitation/7ad0c9eb82b6175bcda9c0dfc2ac51161ef5ba
 * cb0988d992c4bce82b3fa5d25"
 * //      @type: "Invitation"
 * //      creation_date: "2021-10-22T11:13:28.762Z"
 * //      email_to: "new_user@terminusdb.com"
 * //      invited_by: "User/auth0%7C6162f8ab33567406a6bee0c"
 * //      role: "Role/dataReader"
 * //      status: "needs_invite"}]
 *
 */
AccessControl.prototype.getPendingOrgInvites = function (orgName) {
  if (!orgName && !this.defaultOrganization) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'GET',
          'Please provide a organization name',
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/invites`, CONST.GET);
};

/**
 * -- TerminusX API ---
 * Send a new invitation
 * @param {string} userEmail -  The email of user.
 * @param {string} role -  The role for user. (the document @id role like Role/collaborator)
 * @param {string} [note] -  The note to send with the invitation.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.sendOrgInvite("new_user@terminusdb.com","Role/admin",
 * "please join myteam").then(result=>{
 *    console.log(result)
 * })
 */
// eslint-disable-next-line default-param-last
AccessControl.prototype.sendOrgInvite = function (userEmail, role, note = '', orgName) {
  let errorMessage;
  if (!orgName && !this.defaultOrganization) {
    errorMessage = 'Please provide a organization name';
  } else if (!userEmail) {
    errorMessage = 'Please provide a user email';
  } else if (!role) {
    errorMessage = 'Please provide a role';
  }

  if (errorMessage) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'POST',
          errorMessage,
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/invites`, CONST.POST, {
    email_to: userEmail,
    role,
    note,
  });
};

/**
 * -- TerminusX API ---
 * Get the invitation info
 * @param {string} inviteId -  The invite id to retrieve.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * const fullInviteId="Organization/my_team_name/invitations/Invitation/7ad0c9eb82b6175bcda9c0dfc
 * 2ac51161ef5ba7cb0988d992c4bce82b3fa5d25"
 * accessControl.getOrgInvite(fullInviteId).then(result=>{
 *  console.log(result)
 * })
 */
AccessControl.prototype.getOrgInvite = function (inviteId, orgName) {
  let errorMessage;
  if (!orgName && !this.defaultOrganization) {
    errorMessage = 'Please provide a organization name';
  } else if (!inviteId) {
    errorMessage = 'Please provide a invite id';
  }

  if (errorMessage) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'POST',
          errorMessage,
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  const inviteHash = UTILS.removeDocType(inviteId);
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/invites/${inviteHash}`, CONST.GET);
};

/**
 * -- TerminusX API ---
 * Delete an invitation
 * @param {string} inviteId -  The invite id to delete.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * const fullInviteId="Organization/my_team_name/invitations/Invitation/7ad0c9eb82b6175bcda9
 * c0dfc2ac51161ef5ba7cb0988d992c4bce82b3fa5d25"
 * accessControl.deleteOrgInvite(fullInviteId).then(result=>{
 *      console.log(result)
 * })
 */
AccessControl.prototype.deleteOrgInvite = function (inviteId, orgName) {
  let errorMessage;
  if (!orgName && !this.defaultOrganization) {
    errorMessage = 'Please provide a organization name';
  } else if (!inviteId) {
    errorMessage = 'Please provide a invite id';
  }

  if (errorMessage) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'POST',
          errorMessage,
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  const inviteHash = UTILS.removeDocType(inviteId);
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/invites/${inviteHash}`, CONST.DELETE);
};

/**
 * -- TerminusX API ---
 * Accept /Reject invitation. if the invitation has been accepted we add the current user
 * to the organization.
 *
 * the only user that can accept this invitation is the user registered with the invitation email,
 * we indentify the user with the jwt token
 * @param {string} inviteId -  The invite id to updated.
 * @param {boolean} accepted -  The status of the invitation.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * const fullInviteId="Organization/my_team_name/invitations/Invitation/7ad0c9eb82b6175bcda9
 * c0dfc2ac51161ef5ba7cb0988d992c4bce82b3fa5d25"
 * accessControl.updateOrgInviteStatus(fullInviteId,true).then(result=>{
 *   console.log(result)
 * })
 */
AccessControl.prototype.updateOrgInviteStatus = function (inviteId, accepted, orgName) {
  let errorMessage;
  if (!orgName && !this.defaultOrganization) {
    errorMessage = 'Please provide a organization name';
  } else if (!inviteId) {
    errorMessage = 'Please provide a invite id';
  } else if (typeof accepted === 'undefined') {
    errorMessage = 'Please provide a accepted status';
  }

  if (errorMessage) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'PUT',
          errorMessage,
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  const inviteHash = UTILS.removeDocType(inviteId);
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/invites/${inviteHash}`, CONST.PUT, {
    accepted,
  });
};

/**
 * -- TerminusX API ---
 * Get the user role for a given organization or the default organization
 * The user is identified by the jwt or the access token
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.getTeamUserRole().then(result=>{
 *  console.log(result)
 * })
 *
 * //response object example
 * {"userRole":"Role/admin"}
 */

AccessControl.prototype.getTeamUserRole = function (orgName) {
  if (!orgName && !this.defaultOrganization) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'GET',
          'Please provide a organization name',
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/role`, CONST.GET);
};

/**
 * -- TerminusX API --
 * Remove an user from an organization, only an admin user can remove an user from an organization
 * @param {string} userId -  The id of the user to be removed. (this is the document user's @id)
 * @param {string} [orgName] -  The organization name in which the user is to be removed.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.removeUserFromOrg("User/auth0%7C613f5dnndjdjkTTT","my_org_name").then(result=>{
 *  console.log(result)
 * })
 *
 */
AccessControl.prototype.removeUserFromOrg = function (userId, orgName) {
  let errorMessage;
  if (!orgName && !this.defaultOrganization) {
    errorMessage = 'Please provide a organization name';
  } else if (!userId) {
    errorMessage = 'Please provide a userId';
  }

  if (errorMessage) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'DELETE',
          errorMessage,
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  const user = UTILS.removeDocType(userId);
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/users/${user}`, CONST.DELETE);
};

/**
 * -- TerminusX API --
 * Get the user's role for every databases under the organization
 * @param {string} userId -  The user's id.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.getDatabaseRolesOfUser('User/auth0%7C61790e366377Yu6596a').then(result=>{
 *      console.log(result)
 * })
 *
 * //this is a capabilities list of databases and roles
 * //[ {capability: "Capability/b395e8523d509dec6b33aefc9baed3b2e2bfadbd4c79d4ff9b20dce2b14e2edc"
 * //if there is an id we have a user specific capabality for this database
 *    // name: {@type: "xsd:string", @value: "profiles_test"}
 *    // role: "Role/dataUpdater"
 *    // scope: "UserDatabase/7ebdfae5a02bc7e8f6d79sjjjsa4e179b1df9d4576a3b1d2e5ff3b4859"
 *    // user: "User/auth0%7C61790e11a3966d006906596a"},
 *
 * //{ capability: null
 * // if the capability id is null the user level of access for this database is the
 * same of the team
 *   //name: {@type: "xsd:string", @value: "Collab002"}
 *   //role: "Role/dataReader"
 *   // scope: "UserDatabase/acfcc2db02b83792sssb15239ccdf586fc5b176846ffe4878b1aea6a36c8f"
 *   //user: "User/auth0%7C61790e11a3966d006906596a"}]
 */
AccessControl.prototype.getDatabaseRolesOfUser = function (userId, orgName) {
  let errorMessage;
  if (!orgName && !this.defaultOrganization) {
    errorMessage = 'Please provide a organization name';
  } else if (!userId) {
    errorMessage = 'Please provide a user id';
  }

  if (errorMessage) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'GET',
          errorMessage,
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  const user = UTILS.removeDocType(userId);
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/users/${user}/databases`, CONST.GET);
};

/**
 * -- TerminusX API --
 * Create a user's a role for a resource (organization/database)
 * @param {string} userId -  The user's id.
 * @param {string} scope -  The resource name/id.
 * @param {string} role -  The user role to be assigned.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * const dbId = "UserDatabase/acfcc2db02b83792sssb15239ccdf586fc5b176846ffe4878b1aea6a36c8f"
 * accessControl.assignUserRole('User/auth0%7C61790e11a3966d006906596a',dbId,
 * "Role/collaborator").then(result=>{
 *      console.log(result)
 *
 * })
 */
AccessControl.prototype.createUserRole = function (userId, scope, role, orgName) {
  let errorMessage;
  if (!orgName && !this.defaultOrganization) {
    errorMessage = 'Please provide a organization name';
  } else if (!userId) {
    errorMessage = 'Please provide a user id';
  } else if (!scope) {
    errorMessage = 'Please provide a scope';
  } else if (!role) {
    errorMessage = 'Please provide a role';
  }

  if (errorMessage) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'POST',
          errorMessage,
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  const user = UTILS.removeDocType(userId);
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/users/${user}/capabilities`, CONST.POST, {
    scope,
    role,
  });
};

/**
 * -- TerminusX API --
 * Update user's a role for a resource (organization/database), (this api works only in terminusX)
 * @param {string} userId -  The user's id.
 * @param {string} capabilityId -  The capability id.
 * @param {string} scope -  The resource name/id.
 * @param {string} role -  The user role to be updated.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * const dbId = "UserDatabase/acfcc2db02b83792sssb15239ccdf586fc5b176846ffe4878b1aea6a36c8f"
 * const capId= "Capability/b395e8523d509dec6b33aefc9baed3b2e2bfadbd4c79d4ff9b20dce2b14e2edc"
 * accessControl.updateUserRole('User/auth0%7C61790e11a3966d006906596a',capId,dbId,
 * "Role/dataUpdater").then(result=>{
 *      console.log(result)
 *
 * })
 */
AccessControl.prototype.updateUserRole = function (userId, capabilityId, scope, role, orgName) {
  let errorMessage;
  if (!orgName && !this.defaultOrganization) {
    errorMessage = 'Please provide a organization name';
  } else if (!userId) {
    errorMessage = 'Please provide a user id';
  } else if (!capabilityId) {
    errorMessage = 'Please provide a capabilityId';
  } else if (!scope) {
    errorMessage = 'Please provide a scope';
  } else if (!role) {
    errorMessage = 'Please provide a role';
  }

  if (errorMessage) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'PUT',
          errorMessage,
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  const user = UTILS.removeDocType(userId);
  const capHash = UTILS.removeDocType(capabilityId);
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/users/${user}/capabilities/${capHash}`, CONST.PUT, {
    scope,
    role,
  });
};

/**
 * -- TerminusX API --
 * Get all the access request list for a specify organization
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.accessRequestsList().then(result=>{
 *  console.log(result)
 * })
 *
 */
AccessControl.prototype.accessRequestsList = function (orgName) {
  if (!orgName && !this.defaultOrganization) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'GET',
          'Please provide a organization name',
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/access_requests`, CONST.GET);
};

/**
 * -- TerminusX API --
 * Get all the access request list for a specify organization
 * @param {string} [email] -  the user email.
 * @param {string} [affiliation] -  the user affiliation, company, university etc..
 * @param {string} [note] -  the message for the team admin
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.sendAccessRequest("myemail@terminusdb.com",
 *  "my_company",
 *  "please add me to your team"
 * ).then(result=>{
 *  console.log(result)
 * })
 *
 */
AccessControl.prototype.sendAccessRequest = function (email, affiliation, note, orgName) {
  if (!orgName && !this.defaultOrganization) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'POST',
          'Please provide a organization name',
        ),
      ),
    );
  }
  const payload = { email, affiliation, note };
  const org = orgName || this.defaultOrganization;
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/access_requests`, CONST.POST, payload);
};

/**
 * -- TerminusX API --
 * Delete an access request to join your team, only an admin user can delete it
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * accessControl.deleteAccessRequest("djjdshhsuuwewueueuiHYHYYW.......").then(result=>{
 *  console.log(result)
 * })
 *
 */
AccessControl.prototype.deleteAccessRequest = function (acceId, orgName) {
  if (!orgName && !this.defaultOrganization) {
    return Promise.reject(
      new Error(
        ErrorMessage.getInvalidParameterMessage(
          'POST',
          'Please provide a organization name',
        ),
      ),
    );
  }
  const org = orgName || this.defaultOrganization;
  return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/access_requests/${acceId}`, CONST.DELETE);
};
module.exports = AccessControl;
