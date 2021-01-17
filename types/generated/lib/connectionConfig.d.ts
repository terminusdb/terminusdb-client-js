export = ConnectionConfig;
/**
 * @file Terminus DB connection configuration
 * @license Apache Version 2
 * @description Object representing the state of a connection to a terminus db - these are:
 * 1. server url (set on connect)
 * 2. current organization id
 * 2. dbid, organization, api key, remote auth
 * along with some configuration information (key, connected mode, client_side_access_control)
 * provides methods for getting and setting connection parameters
 */
declare function ConnectionConfig(serverUrl: any, params: any): void;
declare class ConnectionConfig {
    /**
     * @file Terminus DB connection configuration
     * @license Apache Version 2
     * @description Object representing the state of a connection to a terminus db - these are:
     * 1. server url (set on connect)
     * 2. current organization id
     * 2. dbid, organization, api key, remote auth
     * along with some configuration information (key, connected mode, client_side_access_control)
     * provides methods for getting and setting connection parameters
     */
    constructor(serverUrl: any, params: any);
    server: any;
    remote_auth: boolean;
    local_auth: boolean;
    organizationid: boolean;
    dbid: boolean;
    default_branch_id: any;
    default_repo_id: string;
    system_db: string;
    api_extension: string;
    branchid: any;
    repoid: string;
    refid: boolean;
    connection_error: boolean;
    copy(): ConnectionConfig;
    update(params: any): void;
    serverURL(): any;
    apiURL(): string;
    db(): boolean;
    branch(): any;
    ref(): boolean;
    organization(): boolean;
    repo(): string;
    localAuth(): boolean;
    local_user(): any;
    remoteAuth(): boolean;
    user(ignore_jwt: any): any;
    parseServerURL(str: any): any;
    clearCursor(): void;
    setCursor(organization: any, db: any, repo: any, branch: any, ref: any): boolean;
    setError(str: any): void;
    setOrganization(inputStr: string): boolean;
    setDB(inputStr: string): boolean;
    setRepo(inputStr: string): string;
    setBranch(inputStr: string): any;
    setRef(inputStr: string): boolean;
    setLocalBasicAuth(userKey: string, userId: string): boolean;
    setLocalAuth(details: any): void;
    setRemoteAuth(details: any): void;
    dbURL(): string;
    userURL(uid: any): string;
    organizationURL(oid: any): string;
    rolesURL(): string;
    updateRolesURL(): string;
    graphURL(type: any, gid: any): string;
    triplesURL(type: any, gid: any): string;
    csvURL(type: any, gid: any): string;
    queryURL(): string;
    classFrameURL(): string;
    cloneURL(new_repo_id: any): string;
    cloneableURL(): string;
    pullURL(): string;
    fetchURL(remote_name: any): string;
    rebaseURL(): string;
    resetURL(): string;
    pushURL(): string;
    branchURL(nuid: any): string;
    dbBase(action: any): string;
    repoBase(action: any): string;
    branchBase(action: any): string;
    dbURLFragment(): string | boolean;
}
