
## AccessControl
#### AccessControl
**License**: Apache Version 2  

#### new AccessControl()
The AccessControl object has various methods to control the access for users.


### getDefaultOrganization
#### accessControl.getDefaultOrganization(params) ⇒ <code>string</code> \| <code>undefined</code>
Get a organization from parameters.

**Returns**: <code>string</code> \| <code>undefined</code> - - organization  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The parameters |


### getAPIToken
#### accessControl.getAPIToken(params) ⇒ <code>string</code>
Get a API token from parameters.

**Returns**: <code>string</code> - apiToken  

| Param | Type | Description |
| --- | --- | --- |
| params | <code>object</code> | The parameters |


### setAPIToken
#### accessControl.setAPIToken(token)
Sets the API token for the object


| Param | Type | Description |
| --- | --- | --- |
| token | <code>string</code> | The api token to use |


### getAPIUrl
#### accessControl.getAPIUrl(cloudAPIUrl) ⇒ <code>string</code>
Get a API url from cloudAPIUrl

**Returns**: <code>string</code> - apiUrl  

| Param | Type | Description |
| --- | --- | --- |
| cloudAPIUrl | <code>string</code> | The base url for cloud |


### getUserRoles
#### accessControl.getUserRoles() ⇒ <code>Promise</code>
Get all the system database roles types.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

### createOrganization
#### accessControl.createOrganization(orgName) ⇒ <code>Promise</code>
Any user can create their own organization.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | The organization name to create |


### ifOrganizationExists
#### accessControl.ifOrganizationExists(orgName) ⇒ <code>Promise</code>
Check if the organization exists.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| orgName | <code>string</code> | The organization name to check if exists. |


### removeUserFromOrg
#### accessControl.removeUserFromOrg(userId, [orgName]) ⇒ <code>Promise</code>
Remove an user from an organization, only an admin user can remove an user from an organization

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | The if of the user to be removed. |
| [orgName] | <code>string</code> | The organization name in which the user is to be removed. |


### getPendingOrgInvites
#### accessControl.getPendingOrgInvites([orgName]) ⇒ <code>Promise</code>
Get the pending invitations list.

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [orgName] | <code>string</code> | The organization name. |


### sendOrgInvite
#### accessControl.sendOrgInvite(userEmail, role, [note], [orgName]) ⇒ <code>Promise</code>
Send a new invitation

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userEmail | <code>string</code> | The email of user. |
| role | <code>string</code> | The role for user. |
| [note] | <code>string</code> | The note to send with the invitation. |
| [orgName] | <code>string</code> | The organization name. |


### getOrgInvite
#### accessControl.getOrgInvite(inviteId, [orgName]) ⇒ <code>Promise</code>
Get the invitation info

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| inviteId | <code>string</code> | The invite id to retrieve. |
| [orgName] | <code>string</code> | The organization name. |


### deleteOrgInvite
#### accessControl.deleteOrgInvite(inviteId, [orgName]) ⇒ <code>Promise</code>
Delete an invitation

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| inviteId | <code>string</code> | The invite id to delete. |
| [orgName] | <code>string</code> | The organization name. |


### updateOrgInviteStatus
#### accessControl.updateOrgInviteStatus(inviteId, accepted, [orgName]) ⇒ <code>Promise</code>
Accept /Reject invitation

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| inviteId | <code>string</code> | The invite id to updated. |
| accepted | <code>boolean</code> | The status of the invitation. |
| [orgName] | <code>string</code> | The organization name. |


### getOrgUsers
#### accessControl.getOrgUsers([orgName]) ⇒ <code>Promise</code>
Get all the organization's users and roles

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| [orgName] | <code>string</code> | The organization name. |


### getDatabaseRolesOfUser
#### accessControl.getDatabaseRolesOfUser(userId, [orgName]) ⇒ <code>Promise</code>
Get the user's role for every databases under the organization

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | The user's id. |
| [orgName] | <code>string</code> | The organization name. |


### assignUserRole
#### accessControl.assignUserRole(userId, scope, role, [orgName]) ⇒ <code>Promise</code>
Assign user's a role for a resource (organization/database)

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | The user's id. |
| scope | <code>string</code> | The resource name/id. |
| role | <code>string</code> | The user role to be assigned. |
| [orgName] | <code>string</code> | The organization name. |


### updateUserRole
#### accessControl.updateUserRole(userId, capabilityId, scope, role, [orgName]) ⇒ <code>Promise</code>
Update user's a role for a resource (organization/database)

**Returns**: <code>Promise</code> - A promise that returns the call response object, or an Error if rejected.  

| Param | Type | Description |
| --- | --- | --- |
| userId | <code>string</code> | The user's id. |
| capabilityId | <code>string</code> | The capability id. |
| scope | <code>string</code> | The resource name/id. |
| role | <code>string</code> | The user role to be updated. |
| [orgName] | <code>string</code> | The organization name. |

