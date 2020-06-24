/* eslint-disable prettier/prettier */
const WOQLClient = require('./woqlClient')
const CONST = require("./const")

WOQLClient.prototype.updateUser = function(agent_name, new_agent_name, label, comment) {
    if (agent_name) {
        let payload = {agent_name: agent_name}
        if (new_agent_name) payload.new_agent_name = new_agent_name
        if (label) payload.label = label
        if (comment) payload.comment = comment
        return this.dispatch(CONST.UPDATE_USER, this.connectionConfig.userURL(), payload)
    }
    let errmsg = `Update User Parameter Error - you must provide an agent_name`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_USER, errmsg)))
}

WOQLClient.prototype.deleteUser = function(agent_name) {
    if (agent_name) {
        let payload = {agent_name: agent_name}
        return this.dispatch(CONST.DELETE_USER, this.connectionConfig.userURL(), payload)
    }
    let errmsg = `Update User Parameter Error - you must provide an agent_name`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_USER, errmsg)))
}

WOQLClient.prototype.createOrganization = function(organization_name, label, comment, sub_organizations, databases) {
    if (organization_name) {
        let payload = {organization_name: organization_name}
        if (label) payload.label = label
        if (comment) payload.comment = comment
        if (sub_organizations) payload.child_organization = sub_organizations
        if (databases) payload.organization_database = databases
        return this.dispatch(CONST.CREATE_ORGANIZATION, this.connectionConfig.userURL(), payload)
    }
    let errmsg = `Create Organization Parameter Error - you must provide an organization_name`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.CREATE_ORGANIZATION, errmsg)))
}

WOQLClient.prototype.updateOrganization = function(organization_name, new_organization_name, label, comment, sub_organizations, databases) {
    if (organization_name) {
        let payload = {organization_name: organization_name}
        if (label) payload.label = label
        if (comment) payload.comment = comment
        if (sub_organizations) payload.child_organization = sub_organizations
        if (databases) payload.organization_database = databases
        return this.dispatch(CONST.UPDATE_ORGANIZATION, this.connectionConfig.organizationURL(organization_name), payload)
    }
    let errmsg = `Create Organization Parameter Error - you must provide an organization_name`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.UPDATE_ORGANIZATION, errmsg)))
}

WOQLClient.prototype.readOrganization = function(organization_name) {
    if (organization_name) {
        return this.dispatch(CONST.READ_ORGANIZATION, this.connectionConfig.organizationURL(organization_name), payload)
    }
    let errmsg = `Create Organization Parameter Error - you must provide an organization_name`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.READ_ORGANIZATION, errmsg)))
}

WOQLClient.prototype.deleteOrganization = function(organization_name) {
    if (organization_name) {
        return this.dispatch(CONST.DELETE_ORGANIZATION, this.connectionConfig.organizationURL(organization_name), payload)
    }
    let errmsg = `Delete Organization Parameter Error - you must provide an organization_name`
    return Promise.reject(new Error(ErrorMessage.getInvalidParameterMessage(CONST.DELETE_ORGANIZATION, errmsg)))
}


WOQLClient.prototype.getRoles = function(organization_name) {}

WOQLClient.prototype.updateRoles = function(organization_name) {}
