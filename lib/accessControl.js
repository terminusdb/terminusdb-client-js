
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

    this.baseURL = this.getAPIUrl(cloudAPIUrl);
    this.apiToken = this.getAPIToken(params);
    this.defaultOrganization = this.getDefaultOrganization(params);

}

/**
 * Get a organization from parameters.
 * @param {object} params -  The parameters
 * @return {string|undefined} - organization
 */
 AccessControl.prototype.getDefaultOrganization = function(params) {
    if(params && params.organization && typeof params.organization === 'string') {
        return params.organization;
    }
    return undefined;
}

/**
 * Get a API token from parameters.
 * @param {object} params -  The parameters
 * @return {string} apiToken
 */
AccessControl.prototype.getAPIToken = function(params) {
    if(params) {
        if(!params.token) throw new Error('TerminusX Access token required');

        return params.token;
    } else {
        if(!process.env.TERMINUSDB_ACCESS_TOKEN) throw new Error('TerminusX Access token required');

        return process.env.TERMINUSDB_ACCESS_TOKEN;
    }
}

/**
 * Sets the API token for the object
 * @param {string} token -  The api token to use
 */
AccessControl.prototype.setAPIToken = function(token) {
    if(!token) {
     throw new Error('TerminusX Access token required');
    }

    this.apiToken = token;
}

/**
 * Get a API url from cloudAPIUrl
 * @param {string} cloudAPIUrl -  The base url for cloud
 * @return {string} apiUrl
 */
AccessControl.prototype.getAPIUrl = function(cloudAPIUrl) {
    if(!cloudAPIUrl || typeof cloudAPIUrl !== 'string') {
        throw new Error('TerminusX api url required!');
    }

    return cloudAPIUrl + 'api';
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

/**
 * Get all the system database roles types.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.getUserRoles = function() {
    return this.dispatch(this.baseURL + "/roles", CONST.GET);
};

/**
 * Any user can create their own organization.
 * @param {string} orgName -  The organization name to create
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.createOrganization = function(orgName) {
    if(!orgName) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    "POST",
                    'Please provide a organization name'
                ),
            ),
        );
    }

    return this.dispatch(this.baseURL + "/organizations", CONST.POST,{
        organization: orgName
    });
};

/**
 * Check if the organization exists.
 * @param {string} orgName -  The organization name to check if exists.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.ifOrganizationExists = function (orgName) {
    if(!orgName) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    "HEAD",
                    'Please provide a organization name'
                ),
            ),
        );
    }

    return this.dispatch(`${this.baseURL}/organizations/${orgName}`, CONST.HEAD);
};

/**
 * Remove an user from an organization, only an admin user can remove an user from an organization
 * @param {string} userId -  The if of the user to be removed.
 * @param {string} [orgName] -  The organization name in which the user is to be removed.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.removeUserFromOrg = function (userId, orgName) {
    let errorMessage;
    if(!orgName && !this.defaultOrganization) {
        errorMessage = 'Please provide a organization name';
    } else if(!userId) {
        errorMessage = 'Please provide a userId';
    }

    if(errorMessage) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    "DELETE",
                    errorMessage
                ),
            ),
        );
    }
    return this.dispatch(`${this.baseURL}/organizations/${orgName ? orgName : this.defaultOrganization}/users/${userId}`, CONST.DELETE);
};

/**
 * Get the pending invitations list.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.getPendingOrgInvites = function (orgName) {
    if(!orgName && !this.defaultOrganization) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    "GET",
                    'Please provide a organization name'
                ),
            ),
        );
    }

    return this.dispatch(`${this.baseURL}/organizations/${orgName ? orgName : this.defaultOrganization}/invites`, CONST.GET);
};

/**
 * Send a new invitation
 * @param {string} userEmail -  The email of user.
 * @param {string} role -  The role for user.
 * @param {string} [note] -  The note to send with the invitation.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.sendOrgInvite = function (userEmail, role, note = '', orgName) {
    let errorMessage;
    if(!orgName && !this.defaultOrganization) {
        errorMessage = 'Please provide a organization name';
    } else if(!userEmail) {
        errorMessage = 'Please provide a user email';
    } else if(!role) {
        errorMessage = 'Please provide a role';
    }

    if(errorMessage) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    "POST",
                    errorMessage
                ),
            ),
        );
    }

    return this.dispatch(`${this.baseURL}/organizations/${orgName ?  orgName : this.defaultOrganization}/invites`, CONST.POST, {
        email_to: userEmail,
        role,
        note,
    });
};

/**
 * Get the invitation info
 * @param {string} inviteId -  The invite id to retrieve.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.getOrgInvite = function (inviteId, orgName) {
    let errorMessage;
    if(!orgName && !this.defaultOrganization) {
        errorMessage = 'Please provide a organization name';
    } else if(!inviteId) {
        errorMessage = 'Please provide a invite id';
    }

    if(errorMessage) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    "POST",
                    errorMessage
                ),
            ),
        );
    }
    return this.dispatch(`${this.baseURL}/organizations/${orgName ? orgName : this.defaultOrganization}/invites/${inviteId}`, CONST.GET);
};

/**
 * Delete an invitation
 * @param {string} inviteId -  The invite id to delete.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.deleteOrgInvite = function (inviteId, orgName) {
    let errorMessage;
    if(!orgName && !this.defaultOrganization) {
        errorMessage = 'Please provide a organization name';
    } else if(!inviteId) {
        errorMessage = 'Please provide a invite id';
    }

    if(errorMessage) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    "POST",
                    errorMessage
                ),
            ),
        );
    }
    return this.dispatch(`${this.baseURL}/organizations/${orgName ? orgName : this.defaultOrganization}/invites/${inviteId}`, CONST.DELETE);
};

/**
 * Accept /Reject invitation
 * @param {string} inviteId -  The invite id to updated.
 * @param {boolean} accepted -  The status of the invitation.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.updateOrgInviteStatus = function (inviteId, accepted, orgName) {
    let errorMessage;
    if(!orgName && !this.defaultOrganization) {
        errorMessage = 'Please provide a organization name';
    } else if(!inviteId) {
        errorMessage = 'Please provide a invite id';
    } else if(typeof accepted === 'undefined') {
        errorMessage = 'Please provide a accepted status';
    }

    if(errorMessage) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    "PUT",
                    errorMessage
                ),
            ),
        );
    }

    return this.dispatch(`${this.baseURL}/organizations/${orgName ?  orgName : this.defaultOrganization}/invites/${inviteId}`, CONST.PUT, {
        accepted
    });
};

/**
 * Get all the organization's users and roles
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.getOrgUsers = function (orgName) {
    if(!orgName && !this.defaultOrganization) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    "GET",
                    'Please provide a organization name'
                ),
            ),
        );
    }

    return this.dispatch(`${this.baseURL}/organizations/${orgName ? orgName : this.defaultOrganization}/users`, CONST.GET);
};

/**
 * Get the user's role for every databases under the organization 
 * @param {string} userId -  The user's id.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.getDatabaseRolesOfUser = function (userId, orgName) {
    let errorMessage;
    if(!orgName && !this.defaultOrganization) {
        errorMessage = 'Please provide a organization name';
    } else if(!userId) {
        errorMessage = 'Please provide a user id';
    }

    if(errorMessage) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    "GET",
                    errorMessage
                ),
            ),
        );
    }

    return this.dispatch(`${this.baseURL}/organizations/${orgName ? orgName : this.defaultOrganization}/users/${userId}/databases`, CONST.GET);
};

/**
 * Assign user's a role for a resource (organization/database)
 * @param {string} userId -  The user's id.
 * @param {string} scope -  The resource name/id.
 * @param {string} role -  The user role to be assigned.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.assignUserRole = function (userId, scope, role, orgName) {

    let errorMessage;
    if(!orgName && !this.defaultOrganization) {
        errorMessage = 'Please provide a organization name';
    } else if(!userId) {
        errorMessage = 'Please provide a user id';
    } else if(!scope) {
        errorMessage = 'Please provide a scope';
    } else if(!role) {
        errorMessage = 'Please provide a role';
    }
    

    if(errorMessage) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    "POST",
                    errorMessage
                ),
            ),
        );
    }

    return this.dispatch(`${this.baseURL}/organizations/${orgName ? orgName : this.defaultOrganization}/users/${userId}/capabilities`, CONST.POST, {
        scope,
        role,
    });
};

/**
 * Update user's a role for a resource (organization/database)
 * @param {string} userId -  The user's id.
 * @param {string} capabilityId -  The capability id.
 * @param {string} scope -  The resource name/id.
 * @param {string} role -  The user role to be updated.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.updateUserRole = function (userId, capabilityId, scope, role, orgName) {
    let errorMessage;
    if(!orgName && !this.defaultOrganization) {
        errorMessage = 'Please provide a organization name';
    } else if(!userId) {
        errorMessage = 'Please provide a user id';
    } else if(!capabilityId) {
        errorMessage = 'Please provide a capabilityId';
    } else if(!scope) {
        errorMessage = 'Please provide a scope';
    } else if(!role) {
        errorMessage = 'Please provide a role';
    }
    

    if(errorMessage) {
        return Promise.reject(
            new Error(
                ErrorMessage.getInvalidParameterMessage(
                    "PUT",
                    errorMessage
                ),
            ),
        );
    }

    return this.dispatch(`${this.baseURL}/organizations/${orgName ? orgName : this.defaultOrganization}/users/${userId}/capabilities/${capabilityId}`, CONST.PUT, {
        scope,
        role,
    });
};

module.exports = AccessControl;
