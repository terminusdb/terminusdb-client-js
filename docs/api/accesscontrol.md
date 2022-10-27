
# AccessControl
## AccessControl
**License**: Apache Version 2  

## new AccessControl()
The AccessControl is a driver to work with
TerminusDB and TerminusX access control api
for the credential you can use the JWT token, the API token or
the basic authentication with username and password

**Example**  
```javascript
//connect with the API token
//(to request a token create an account in  https://terminusdb.com/)
const accessContol = new AccessControl("https://servername.com",
{organization:"my_team_name",
token:"dGVybWludXNkYjovLy9kYXRhL2tleXNfYXB........"})
accessControl.getOrgUsers().then(result=>{
     console.log(result)
})

//connect with the jwt token this type of connection is only for the dashboard
//or for application integrate with our login workflow
const accessContol = new AccessControl("https://servername.com",
{organization:"my_team_name",
jwt:"eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkpXUjBIOXYyeTFORUd........"})
accessControl.getOrgUsers().then(result=>{
     console.log(result)
})

//if the jwt is expired you can change it with
accessControl.setJwtToken("eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6IkpXUjBIOXYy
eTFORUd.......")

//connect with the base authentication this type of connection is only for the local installation
const accessContol = new AccessControl("http://localhost:6363",
{organization:"my_team_name", user:"admin"
key:"mykey"})
accessControl.getOrgUsers().then(result=>{
    console.log(result)
})
```

## getDefaultOrganization
##### accessControl.getDefaultOrganization(params) ⇒ <code>string</code> \| <code>undefined</code>
Get a organization from parameters.

**Returns**: <code>string</code> \| <code>undefined</code> - - organization  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The parameters |


## setJwtToken
##### accessControl.setJwtToken(jwt)
Sets the Jwt token for the object


| Param | Type | Description |
| --- | --- | --- |
| jwt | <code>string</code> | The jwt api token to use |


## setApiToken
##### accessControl.setApiToken(atokenpi)
Sets the API token for the object, to request a token create an account in  https://terminusdb.com/


| Param | Type | Description |
| --- | --- | --- |
| atokenpi | <code>string</code> | The API token to use to connect with TerminusX |


## setApiKey
##### accessControl.setApiKey(atokenpi)
Sets the API token for the object, to request a token create an account in  https://terminusdb.com/


| Param | Type | Description |
| --- | --- | --- |
| atokenpi | <code>string</code> | The API token to use to connect with TerminusX |


## getAPIUrl
##### accessControl.getAPIUrl(cloudAPIUrl) ⇒ <code>string</code>
Get a API url from cloudAPIUrl

**Returns**: <code>string</code> - apiUrl  

| Param | Type | Description |
| --- | --- | --- |
| cloudAPIUrl | <code>string</code> | The base url for cloud |


## customHeaders
##### accessControl.customHeaders(customHeaders) ⇒ <code>object</code>
add extra headers to your request


| Param | Type |
| --- | --- |
| customHeaders | <code>object</code> | 


## getOrganization
##### accessControl.getOrganization(organization) ⇒ <code>object</code>
-- TerminusDB API ---
Get an organization from the TerminusDB API.

**Returns**: <code>object</code> - - organization  

| Param | Type | Description |
| --- | --- | --- |
| organization | <code>string</code> | The organization |


## getAllOrganizations
##### accessControl.getAllOrganizations() ⇒ <code>Promise</code>
-- TerminusDB API ---
This end point works in basic authentication, admin user
Get list of organizations

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

## createOrganization
##### accessControl.createOrganization(orgName) ⇒ <code>Promise</code>
-- TerminusDB API ---
This end point works in basic authentication, admin user
Create an organization

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | The organization name to create |

**Example**  
```javascript
accessControl.createOrganization("my_org_name").then(result=>{
     console.log(result)
})
```

## deleteOrganization
##### accessControl.deleteOrganization(orgName) ⇒ <code>Promise</code>
-- TerminusDB API ---
Delete an Organization

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | The organization name to delete |

**Example**  
```javascript
accessControl.createOrganization("my_org_name").then(result=>{
     console.log(result)
})
```

## createRole
##### accessControl.createRole([name], [actions]) ⇒ <code>Promise</code>
--TerminusDB API ---
basic authentication, admin user.
Create a new role in the system database.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | The role name. |
| [actions] | <code>typedef.RolesActions</code> | A list of actions |

**Example**  
```javascript
accessControl.createRole("Reader",[ACTIONS.INSTANCE_READ_ACCESS]).then(result=>{
 console.log(result)
})
```

## deleteRole
##### accessControl.deleteRole([name]) ⇒ <code>Promise</code>
-- TerminusdDB API ---
basic Authentication, admin user.
Delete role in the system database, (this api is enabled only in the local installation)

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [name] | <code>string</code> | The role name. |

**Example**  
```javascript
accessControl.deleteRole("Reader").then(result=>{
 console.log(result)
})
```

## getAllUsers
##### accessControl.getAllUsers() ⇒ <code>Promise</code>
-- TerminusdDB API ---
basic Authentication, admin user.
Return the list of all the users (this api is enabled only in the local installation)

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  
**Example**  
```javascript
accessControl.getAllUsers().then(result=>{
 console.log(result)
})
```

## createUser
##### accessControl.createUser(name, [password]) ⇒ <code>Promise</code>
-- TerminusdDB API ---
basic Authentication, admin user.
Add the user into the system database

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | the user name |
| [password] | <code>string</code> | you need the password for basic authentication |

**Example**  
```javascript
accessControl.deleteUser(userId).then(result=>{
 console.log(result)
})
```

## deleteUser
##### accessControl.deleteUser(userId) ⇒ <code>Promise</code>
-- TerminusdDB API ---
basic Authentication, admin user.
Remove the user from the system database.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | the document user id |

**Example**  
```javascript
accessControl.deleteUser(userId).then(result=>{
 console.log(result)
})
```

## manageCapability
##### accessControl.manageCapability(userName, resourceName, rolesArr, operation, scopeType) ⇒ <code>Promise</code>
-- TerminusdDB API ---
Grant/Revoke Capability

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userName | <code>string</code> | the document user id |
| resourceName | <code>string</code> | the name of a (database or team) |
| rolesArr | <code>array</code> | the roles name list |
| operation | <code>typedef.CapabilityCommand</code> | grant/revoke operation |
| scopeType | <code>typedef.ScopeType</code> | the resource type (database or organization) |

**Example**  
```javascript
//we add an user to an organization and manage users' access
//the user myUser can  access the Organization and all the database under the organization with "reader" Role
client.manageCapability(myUser,myteam,[reader],"grant","organization").then(result=>{
 consol.log(result)
})

//the user myUser can  access the database db__001 under the organization myteam
//with "writer" Role
client.manageCapability(myUser,myteam/db__001,[writer],"grant","database").then(result=>{
 consol.log(result)
})
```

## getAccessRoles
##### accessControl.getAccessRoles() ⇒ <code>Promise</code>
--TerminusX and TerminusDB API ---
Get all the system database roles types.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

## getOrgUsers
##### accessControl.getOrgUsers([orgName]) ⇒ <code>Promise</code>
-- TerminusX and TerminusDB API --
Get all the organization's users and roles,

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
accessControl.getOrgUsers().then(result=>{
 console.log(result)
})

//this function will return an array of capabilities with users and roles
//-- TerminusX --  response array example
//[{capability: "Capability/3ea26e1d698821c570afe9cb4fe81a3......"
//     email: {@type: "xsd:string", @value: "user@terminusdb.com"}
//     picture: {@type: "xsd:string",…}
//     role: "Role/dataReader"
//     scope: "Organization/my_org_name"
//     user: "User/auth0%7C613f5dnndjdjkTTT"}]
//
//
// -- Local Installation -- response array example
//[{ "@id":"User/auth0%7C615462f8ab33f4006a6bee0c",
//  "capability": [{
//   "@id":"Capability/c52af34b71f6f8916ac0115ecb5fe0e31248ead8b1e3d100852015...",
//   "@type":"Capability",
//  "role": [{
//    "@id":"Role/admin",
//    "@type":"Role",
//    "action": ["instance_read_access"],
//     "name":"Admin Role"
//     }],
//  "scope":"Organization/@team"}]]
```

## getTeamUserRoles
##### accessControl.getTeamUserRoles([userName], [orgName]) ⇒ <code>Promise</code>
-- TerminusX and TerminusDB API --
Get the user roles for a given organization or the default organization,

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [userName] | <code>string</code> | The organization name. |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
accessControl.getTeamUserRole("myUser").then(result=>{
 console.log(result)
})

//response object example
{
 "@id": "User/myUser",
  "capability": [
        {
          "@id":"Capability/server_access",
          "@type":"Capability",
          "role": [{
             "@id":"Role/reader",
              "@type":"Role",
             "action": [
                "instance_read_access",
             ],
              "name":"reader"
            }],
          "scope":"Organization/myteam"
        }
      ],
  "name": "myUser"
}
```

## ifOrganizationExists
##### accessControl.ifOrganizationExists(orgName) ⇒ <code>Promise</code>
-- TerminusX API ---
Check if the organization exists. it is a Head call .
IMPORTANT This does not work with the API-TOKEN.

**Returns**: <code>Promise</code> - A promise that returns the call status object,  200: if the organization
exists and 404: if the organization does not exist  

| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | The organization name to check if exists. |


## createOrganizationRemote
##### accessControl.createOrganizationRemote(orgName) ⇒ <code>Promise</code>
-- TerminusX API ---
IMPORTANT This does not work with the API-TOKEN.
Create an organization

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | The organization name to create |

**Example**  
```javascript
accessControl.createOrganization("my_org_name").then(result=>{
     console.log(result)
})
```

## getPendingOrgInvites
##### accessControl.getPendingOrgInvites([orgName]) ⇒ <code>Promise</code>
-- TerminusX API ---
Get the pending invitations list.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
const invitationList = accessControl.getPendingOrgInvites().then(result=>{
   console.log(invitationList)

})
//this will return an array of invitations object like this
//[{@id: "Organization/my_team_name/invitations/Invitation/7ad0c9eb82b6175bcda9c0dfc2ac51161ef5ba
cb0988d992c4bce82b3fa5d25"
//      @type: "Invitation"
//      creation_date: "2021-10-22T11:13:28.762Z"
//      email_to: "new_user@terminusdb.com"
//      invited_by: "User/auth0%7C6162f8ab33567406a6bee0c"
//      role: "Role/dataReader"
//      status: "needs_invite"}]
```

## sendOrgInvite
##### accessControl.sendOrgInvite(userEmail, role, [note], [orgName]) ⇒ <code>Promise</code>
-- TerminusX API ---
Send a new invitation

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userEmail | <code>string</code> | The email of user. |
| role | <code>string</code> | The role for user. (the document @id role like Role/collaborator) |
| [note] | <code>string</code> | The note to send with the invitation. |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
accessControl.sendOrgInvite("new_user@terminusdb.com","Role/admin",
"please join myteam").then(result=>{
   console.log(result)
})
```

## getOrgInvite
##### accessControl.getOrgInvite(inviteId, [orgName]) ⇒ <code>Promise</code>
-- TerminusX API ---
Get the invitation info

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| inviteId | <code>string</code> | The invite id to retrieve. |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
const fullInviteId="Organization/my_team_name/invitations/Invitation/7ad0c9eb82b6175bcda9c0dfc
2ac51161ef5ba7cb0988d992c4bce82b3fa5d25"
accessControl.getOrgInvite(fullInviteId).then(result=>{
 console.log(result)
})
```

## deleteOrgInvite
##### accessControl.deleteOrgInvite(inviteId, [orgName]) ⇒ <code>Promise</code>
-- TerminusX API ---
Delete an invitation

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| inviteId | <code>string</code> | The invite id to delete. |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
const fullInviteId="Organization/my_team_name/invitations/Invitation/7ad0c9eb82b6175bcda9
c0dfc2ac51161ef5ba7cb0988d992c4bce82b3fa5d25"
accessControl.deleteOrgInvite(fullInviteId).then(result=>{
     console.log(result)
})
```

## updateOrgInviteStatus
##### accessControl.updateOrgInviteStatus(inviteId, accepted, [orgName]) ⇒ <code>Promise</code>
-- TerminusX API ---
Accept /Reject invitation. if the invitation has been accepted we add the current user
to the organization.

the only user that can accept this invitation is the user registered with the invitation email,
we indentify the user with the jwt token

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| inviteId | <code>string</code> | The invite id to updated. |
| accepted | <code>boolean</code> | The status of the invitation. |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
const fullInviteId="Organization/my_team_name/invitations/Invitation/7ad0c9eb82b6175bcda9
c0dfc2ac51161ef5ba7cb0988d992c4bce82b3fa5d25"
accessControl.updateOrgInviteStatus(fullInviteId,true).then(result=>{
  console.log(result)
})
```

## getTeamUserRole
##### accessControl.getTeamUserRole([orgName]) ⇒ <code>Promise</code>
-- TerminusX API ---
Get the user role for a given organization or the default organization
The user is identified by the jwt or the access token

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
accessControl.getTeamUserRole().then(result=>{
 console.log(result)
})

//response object example
{"userRole":"Role/admin"}
```

## removeUserFromOrg
##### accessControl.removeUserFromOrg(userId, [orgName]) ⇒ <code>Promise</code>
-- TerminusX API --
Remove an user from an organization, only an admin user can remove an user from an organization

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | The id of the user to be removed. (this is the document user's @id) |
| [orgName] | <code>string</code> | The organization name in which the user is to be removed. |

**Example**  
```javascript
accessControl.removeUserFromOrg("User/auth0%7C613f5dnndjdjkTTT","my_org_name").then(result=>{
 console.log(result)
})
```

## getDatabaseRolesOfUser
##### accessControl.getDatabaseRolesOfUser(userId, [orgName]) ⇒ <code>Promise</code>
-- TerminusX API --
Get the user's role for every databases under the organization

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | The user's id. |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
accessControl.getDatabaseRolesOfUser('User/auth0%7C61790e366377Yu6596a').then(result=>{
     console.log(result)
})

//this is a capabilities list of databases and roles
//[ {capability: "Capability/b395e8523d509dec6b33aefc9baed3b2e2bfadbd4c79d4ff9b20dce2b14e2edc"
//if there is an id we have a user specific capabality for this database
   // name: {@type: "xsd:string", @value: "profiles_test"}
   // role: "Role/dataUpdater"
   // scope: "UserDatabase/7ebdfae5a02bc7e8f6d79sjjjsa4e179b1df9d4576a3b1d2e5ff3b4859"
   // user: "User/auth0%7C61790e11a3966d006906596a"},

//{ capability: null
// if the capability id is null the user level of access for this database is the
same of the team
  //name: {@type: "xsd:string", @value: "Collab002"}
  //role: "Role/dataReader"
  // scope: "UserDatabase/acfcc2db02b83792sssb15239ccdf586fc5b176846ffe4878b1aea6a36c8f"
  //user: "User/auth0%7C61790e11a3966d006906596a"}]
```

## createUserRole
##### accessControl.createUserRole(userId, scope, role, [orgName]) ⇒ <code>Promise</code>
-- TerminusX API --
Create a user's a role for a resource (organization/database)

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | The user's id. |
| scope | <code>string</code> | The resource name/id. |
| role | <code>string</code> | The user role to be assigned. |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
const dbId = "UserDatabase/acfcc2db02b83792sssb15239ccdf586fc5b176846ffe4878b1aea6a36c8f"
accessControl.assignUserRole('User/auth0%7C61790e11a3966d006906596a',dbId,
"Role/collaborator").then(result=>{
     console.log(result)

})
```

## updateUserRole
##### accessControl.updateUserRole(userId, capabilityId, scope, role, [orgName]) ⇒ <code>Promise</code>
-- TerminusX API --
Update user's a role for a resource (organization/database), (this api works only in terminusX)

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | The user's id. |
| capabilityId | <code>string</code> | The capability id. |
| scope | <code>string</code> | The resource name/id. |
| role | <code>string</code> | The user role to be updated. |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
const dbId = "UserDatabase/acfcc2db02b83792sssb15239ccdf586fc5b176846ffe4878b1aea6a36c8f"
const capId= "Capability/b395e8523d509dec6b33aefc9baed3b2e2bfadbd4c79d4ff9b20dce2b14e2edc"
accessControl.updateUserRole('User/auth0%7C61790e11a3966d006906596a',capId,dbId,
"Role/dataUpdater").then(result=>{
     console.log(result)

})
```

## accessRequestsList
##### accessControl.accessRequestsList([orgName]) ⇒ <code>Promise</code>
-- TerminusX API --
Get all the access request list for a specify organization

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
accessControl.accessRequestsList().then(result=>{
 console.log(result)
})
```

## sendAccessRequest
##### accessControl.sendAccessRequest([email], [affiliation], [note], [orgName]) ⇒ <code>Promise</code>
-- TerminusX API --
Get all the access request list for a specify organization

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [email] | <code>string</code> | the user email. |
| [affiliation] | <code>string</code> | the user affiliation, company, university etc.. |
| [note] | <code>string</code> | the message for the team admin |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
accessControl.sendAccessRequest("myemail@terminusdb.com",
 "my_company",
 "please add me to your team"
).then(result=>{
 console.log(result)
})
```

## deleteAccessRequest
##### accessControl.deleteAccessRequest([orgName]) ⇒ <code>Promise</code>
-- TerminusX API --
Delete an access request to join your team, only an admin user can delete it

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [orgName] | <code>string</code> | The organization name. |

**Example**  
```javascript
accessControl.deleteAccessRequest("djjdshhsuuwewueueuiHYHYYW.......").then(result=>{
 console.log(result)
})
```
