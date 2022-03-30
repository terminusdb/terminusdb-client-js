
# AccessControl new new
## AccessControl new new
**License**: Apache Version 2  

## new AccessControl new new()
The AccessControl object has various methods to control the access for users. new
for the credential you can use the JWT token or the API token new

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
```
