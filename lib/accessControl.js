
const DispatchRequest = require('./dispatchRequest');
const ErrorMessage = require('./errorMessage');
const CONST = require('./const');

/**
 * @license Apache Version 2
 * @module AccessControl
 * @constructor AccessControl
 * @description The AccessControl object has various methods to control the access for users.
 */

function AccessControl(cloudAPIUrl, params) {

    this.baseURL = cloudAPIUrl + 'api';
    this.apiToken = this.getAPIToken(params);

}

AccessControl.prototype.getAPIToken = function(params) {
    if(params) {
        if(!params.token) throw new Error('TerminusX Access token required');

        return params.token;
    } else {
        if(!process.env.TERMINUSDB_ACCESS_TOKEN) throw new Error('TerminusX Access token required');

        return process.env.TERMINUSDB_ACCESS_TOKEN;
    }
}

AccessControl.prototype.dispatch = function(requestUrl, action, payload) {
    if (!requestUrl) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    action,
                    'Invalid request URL'
                ),
            ),
        );
    }

    return DispatchRequest(
        requestUrl,
        action,
        payload,
        { type: 'jwt', key: this.apiToken }
    );
}

AccessControl.prototype.getUserRoles = function() {
    return this.dispatch(this.baseURL + "/roles", CONST.GET);
};

AccessControl.prototype.createOrganization = function(orgName) {
    return this.dispatch(this.baseURL + "/organizations", CONST.POST,{
        organization: orgName
    });
};

AccessControl.prototype.ifOrganizationExists = function (orgName) {
    return this.dispatch(`${this.baseURL}/organizations/${orgName}`, CONST.HEAD);
};

AccessControl.prototype.removeUserFromOrg = function (orgName, userId) {
    return this.dispatch(`${this.baseURL}/organizations/${orgName}/users/${userId}`, CONST.DELETE);
};

AccessControl.prototype.getPendingOrgInvites = function (orgName) {
    return this.dispatch(`${this.baseURL}/organizations/${orgName}/invites`, CONST.GET);
};

AccessControl.prototype.sendOrgInvite = function (orgName, userEmail, role, note = '') {
    return this.dispatch(`${this.baseURL}/organizations/${orgName}/invites`, CONST.POST, {
        email_to: userEmail,
        role,
        note,
    });
};

AccessControl.prototype.getOrgInvite = function (orgName, inviteId) {
    return this.dispatch(`${this.baseURL}/organizations/${orgName}/invites/${inviteId}`, CONST.GET);
};

AccessControl.prototype.deleteOrgInvite = function (orgName, inviteId) {
    return this.dispatch(`${this.baseURL}/organizations/${orgName}/invites/${inviteId}`, CONST.DELETE);
};

AccessControl.prototype.updateOrgInviteStatus = function (orgName, inviteId, accepted) {
    return this.dispatch(`${this.baseURL}/organizations/${orgName}/invites/${inviteId}`, CONST.PUT, {
        accepted
    });
};

AccessControl.prototype.getOrgUsers = function (orgName) {
    return this.dispatch(`${this.baseURL}/organizations/${orgName}/users`, CONST.GET);
};

AccessControl.prototype.getDatabaseRolesOfUser = function (orgName, userId) {
    return this.dispatch(`${this.baseURL}/organizations/${orgName}/users/${userId}/databases`, CONST.GET);
};

AccessControl.prototype.assignUserRole = function (orgName, userId, scope, role) {
    return this.dispatch(`${this.baseURL}/organizations/${orgName}/users/${userId}/capabilities`, CONST.POST, {
        scope,
        role,
    });
};

AccessControl.prototype.updateUserRole = function (orgName, userId, capabilityId, scope, role) {
    return this.dispatch(`${this.baseURL}/organizations/${orgName}/users/${userId}/capabilities/${capabilityId}`, CONST.PUT, {
        scope,
        role,
    });
};

module.exports = AccessControl;
