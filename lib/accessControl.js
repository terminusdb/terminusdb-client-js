
const DispatchRequest = require('./dispatchRequest');
const ErrorMessage = require('./errorMessage');
const CONST = require('./const');
const UTILS = require('./utils')

/**
 * @license Apache Version 2
 * @module AccessControl
 * @constructor AccessControl
 * @description The AccessControl object has various methods to control the access for users.
 * @example
 * const accessContol = new AccessControl("https://servername.com",
 * {organization:"my_team_name",
 * jwt:"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkpXUjBIOXYyeTFORUd........"})
 * accessControl.getOrgUsers().then(result=>{
 *      console.log(result)
 * })
 * //if the jwt is expired you can change it with
 *  accessControl.setJwtToken("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkpXUjBIOXYyeTFORUd.......")
 */

function AccessControl(cloudAPIUrl, params) {

    this.baseURL = this.getAPIUrl(cloudAPIUrl);
    this.apiJwtToken = this.getJwtToken(params);
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
 * @return {string} jwt api token
 */
AccessControl.prototype.getJwtToken = function(params) {
    if(params) {
        if(!params.jwt) throw new Error('TerminusX Access token required');

        return params.jwt;
    } else {
        if(!process.env.TERMINUSDB_ACCESS_TOKEN) throw new Error('TerminusX Access token required');

        return process.env.TERMINUSDB_ACCESS_TOKEN;
    }
}

/**
 * Sets the API token for the object
 * @param {string} jwt -  The jwt api token to use
 */
AccessControl.prototype.setJwtToken = function(jwt) {
    if(!jwt) {
     throw new Error('TerminusX Access token required');
    }

    this.apiJwtToken = jwt;
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
    if (cloudAPIUrl.lastIndexOf('/') !== cloudAPIUrl.length - 1) {
        cloudAPIUrl += '/' //always append slash to ensure regularity
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
        { type: 'jwt', key: this.apiJwtToken }
    );
}

/**
 * Get all the system database roles types.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 */
AccessControl.prototype.getAccessRoles = function() {
    return this.dispatch(this.baseURL + "/roles", CONST.GET);
};

/**
 * Any user can create their own organization.
 * IMPORTANT This does not work with the API-TOKEN.
 * @param {string} orgName -  The organization name to create
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example 
 * accessControl.createOrganization("my_org_name").then(result=>{
 *      console.log(result)
 * })
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
 * Check if the organization exists. it is a Head call .
 * IMPORTANT This does not work with the API-TOKEN.
 * @param {string} orgName -  The organization name to check if exists.
 * @return {Promise} A promise that returns the call status object,  200: if the organization exists and 404: if the organization does not exist
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
    
    return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(orgName)}`, CONST.HEAD);
};

/**
 * Get the pending invitations list.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 * @example
 * const invitationList = accessControl.getPendingOrgInvites().then(result=>{
 *    console.log(invitationList)
 *
 * })
 * //this will return an array of invitations object like this
 * //[{@id: "Organization/my_team_name/invitations/Invitation/7ad0c9eb82b6175bcda9c0dfc2ac51161ef5ba7cb0988d992c4bce82b3fa5d25"
 * //      @type: "Invitation"
 * //      creation_date: "2021-10-22T11:13:28.762Z"
 * //      email_to: "new_user@terminusdb.com"
 * //      invited_by: "User/auth0%7C6162f8ab33567406a6bee0c"
 * //      role: "Role/dataReader"
 * //      status: "needs_invite"}]
 * 
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
    const org = orgName ? orgName : this.defaultOrganization
    return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/invites`, CONST.GET);
};

/**
 * Send a new invitation
 * @param {string} userEmail -  The email of user.
 * @param {string} role -  The role for user. (the document @id role like Role/collaborator)
 * @param {string} [note] -  The note to send with the invitation.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example 
 * accessControl.sendOrgInvite("new_user@terminusdb.com","Role/admin","please join my team").then(result=>{
 *    console.log(result)
 * })
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
    const org = orgName ?  orgName : this.defaultOrganization
    return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/invites`, CONST.POST, {
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
 * @example
 * const fullInviteId="Organization/my_team_name/invitations/Invitation/7ad0c9eb82b6175bcda9c0dfc2ac51161ef5ba7cb0988d992c4bce82b3fa5d25"
 * accessControl.getOrgInvite(fullInviteId).then(result=>{
 *  console.log(result)
 * })
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
    const org = orgName ?  orgName : this.defaultOrganization
    const inviteHash = UTILS.removeDocType(inviteId)
    return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/invites/${inviteHash}`, CONST.GET);
};

/**
 * Delete an invitation
 * @param {string} inviteId -  The invite id to delete.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected.
 * @example
 * const fullInviteId="Organization/my_team_name/invitations/Invitation/7ad0c9eb82b6175bcda9c0dfc2ac51161ef5ba7cb0988d992c4bce82b3fa5d25"
 * accessControl.deleteOrgInvite(fullInviteId).then(result=>{
 *      console.log(result)
 * })
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
    const org = orgName ?  orgName : this.defaultOrganization
    const inviteHash = UTILS.removeDocType(inviteId)
    return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/invites/${inviteHash}`, CONST.DELETE);
};

/**
 * Accept /Reject invitation. if the invitation has been accepted we add the current user to the organization. 
 * 
 * the only user that can accept this invitation is the user registered with the invitation email, 
 * we indentify the user with the jwt token
 * @param {string} inviteId -  The invite id to updated.
 * @param {boolean} accepted -  The status of the invitation.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 * @example
 * const fullInviteId="Organization/my_team_name/invitations/Invitation/7ad0c9eb82b6175bcda9c0dfc2ac51161ef5ba7cb0988d992c4bce82b3fa5d25"
 * accessControl.updateOrgInviteStatus(fullInviteId,true).then(result=>{
 *   console.log(result)
 * })
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
    const org = orgName ?  orgName : this.defaultOrganization
    const inviteHash = UTILS.removeDocType(inviteId)
    return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/invites/${inviteHash}`, CONST.PUT, {
        accepted
    });
};

/**
 * Get all the organization's users and roles
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 * @example 
 * accessControl.getOrgUsers().then(result=>{
 *  console.log(result)
 * })
 * 
 * //this function will return an array of capabilities with users and roles
 * //[{capability: "Capability/3ea26e1d698821c570afe9cb4fe81a3......"
 * //     email: {@type: "xsd:string", @value: "user@terminusdb.com"}
 * //     picture: {@type: "xsd:string",…}
 * //     role: "Role/dataReader"
 * //     scope: "Organization/my_org_name"
 * //     user: "User/auth0%7C613f5dnndjdjkTTT"}]
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
    const org = orgName ? orgName : this.defaultOrganization
    return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/users`, CONST.GET);
};

/**
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
    const org = orgName ? orgName : this.defaultOrganization
    const user = UTILS.removeDocType(userId)
    return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/users/${user}`, CONST.DELETE);
};


/**
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
 * // if the capability id is null the user level of access for this database is the same of the team
 *   //name: {@type: "xsd:string", @value: "Collab002"}
 *   //role: "Role/dataReader"
 *   // scope: "UserDatabase/acfcc2db02b83792sssb15239ccdf586fc5b176846ffe4878b1aea6a36c8f"
 *   //user: "User/auth0%7C61790e11a3966d006906596a"}]  
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
    const org = orgName ? orgName : this.defaultOrganization
    const user = UTILS.removeDocType(userId)
    return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/users/${user}/databases`, CONST.GET);
};

/**
 * Create a user's a role for a resource (organization/database)
 * @param {string} userId -  The user's id.
 * @param {string} scope -  The resource name/id.
 * @param {string} role -  The user role to be assigned.
 * @param {string} [orgName] -  The organization name.
 * @return {Promise} A promise that returns the call response object, or an Error if rejected. 
 * @example
 * const dbId = "UserDatabase/acfcc2db02b83792sssb15239ccdf586fc5b176846ffe4878b1aea6a36c8f"
 * accessControl.assignUserRole('User/auth0%7C61790e11a3966d006906596a',dbId,"Role/collaborator").then(result=>{
 *      console.log(result)
 * 
 * })
 */
AccessControl.prototype.createUserRole = function (userId, scope, role, orgName) {
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
    const org = orgName ? orgName : this.defaultOrganization
    const user = UTILS.removeDocType(userId)
    return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/users/${user}/capabilities`, CONST.POST, {
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
 * @example
 * const dbId = "UserDatabase/acfcc2db02b83792sssb15239ccdf586fc5b176846ffe4878b1aea6a36c8f"
 * const capId= "Capability/b395e8523d509dec6b33aefc9baed3b2e2bfadbd4c79d4ff9b20dce2b14e2edc"
 * accessControl.updateUserRole('User/auth0%7C61790e11a3966d006906596a',capId,dbId,"Role/dataUpdater").then(result=>{
 *      console.log(result)
 * 
 * })
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
    const org = orgName ? orgName : this.defaultOrganization
    const user = UTILS.removeDocType(userId)
    const capHash = UTILS.removeDocType(capabilityId)
    return this.dispatch(`${this.baseURL}/organizations/${UTILS.encodeURISegment(org)}/users/${user}/capabilities/${capHash}`, CONST.PUT, {
        scope,
        role,
    });
};

module.exports = AccessControl;
