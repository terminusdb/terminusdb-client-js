export = WOQLClient;
/**
 * @file Javascript WOQL client object
 * @license Apache Version 2
 * Simple Javascript Client for accessing the Terminus DB API
 * Constructor
 * @param {serverUrl} string
 * @param {object} params - a json object with the following connection parameters:
 * 	key: api key for basic auth
 * 	user: basic auth user id
 * 	jwt: jwt token
 * 	jwt_user: jwt user id
 * 	organization: set organization to this id
 * 	db: set cursor to this db
 *  repo: set cursor to this repo
 *  branch: set branch to this id
 */
declare function WOQLClient(serverUrl: any, params: object): void;
declare class WOQLClient {
    /**
     * @file Javascript WOQL client object
     * @license Apache Version 2
     * Simple Javascript Client for accessing the Terminus DB API
     * Constructor
     * @param {serverUrl} string
     * @param {object} params - a json object with the following connection parameters:
     * 	key: api key for basic auth
     * 	user: basic auth user id
     * 	jwt: jwt token
     * 	jwt_user: jwt user id
     * 	organization: set organization to this id
     * 	db: set cursor to this db
     *  repo: set cursor to this repo
     *  branch: set branch to this id
     */
    constructor(serverUrl: any, params: object);
    connectionConfig: ConnectionConfig;
    connection: ConnectionCapabilities;
    copy(): WOQLClient;
    server(): string;
    api(): string;
    organization(accid: any): boolean;
    user(): {};
    uid(): any;
    user_organization(): any;
    databases(dbs: any): boolean;
    get_database(dbid: any, orgid: any): any;
    db(dbid: string): boolean;
    set_system_db(): void;
    repo(repoid: string): string;
    checkout(branchid: string): any;
    ref(refid: string): boolean;
    local_auth(key: string, type: any, user: string): boolean;
    remote_auth(authInfo: any): boolean;
    author(aname: any): any;
    set(params: object): void;
    resource(type: any, val: any): string;
    public connect(config: object): Promise<any>;
    public createDatabase(dbid: string, doc: any, orgid?: string): Promise<any>;
    deleteDatabase(dbid: string, orgid: string, force: any): Promise<any>;
    createGraph(type: string, gid: string, commit_msg: string): any;
    deleteGraph(type: string, gid: string, commit_msg: string): any;
    getTriples(gtype: string, gid: string): Promise<any>;
    updateTriples(gtype: string, gid: string, turtle: string, commit_msg: string): Promise<any>;
    insertTriples(gtype: string, gid: string, turtle: string, commit_msg: string): Promise<any>;
    insertCSV(csv_path: any[], commit_msg: string, gtype: string, gid: string): Promise<any>;
    updateCSV(csv_path: any[], commit_msg: string, gtype: string, gid: string): Promise<any>;
    getCSV(csv_name: string, download: string, gtype: string, gid: string): Promise<any>;
    deleteCSV(csv_name: any[], commit_msg: string): Promise<any>;
    message(message: any): any;
    info(): any;
    query(woql: any, commit_msg: string, all_witnesses: any): any;
    branch(new_branch_id: string, source_free: string): Promise<any>;
    pull(remote_source_repo?: object): any;
    fetch(remote_id?: string): any;
    push(remote_target_repo?: object): any;
    rebase(rebase_source: any): any;
    reset(commit_path: any): any;
    clonedb(clone_source: object, newid: string, orgid: any): any;
    dispatch(action: any, api_url: any, payload: any): any;
    generateCommitInfo(msg: string, author?: string): {
        commit_info: {
            author: string;
            message: string;
        };
    };
    prepareRevisionControlArgs(rc_args: object): any;
    _load_db_prefixes(dbs: any): any;
    getClassFrame(cls: string): any;
    getDatabase(): any;
    updateDatabase(doc: any): Promise<any>;
    user_organizations(): boolean;
    get_organization(resname: any): any;
    organizations(res: any): any;
    action_permitted(action: any, resource: any): boolean;
    createUser(uid: any, doc: any): any;
    getUser(uid: any): any;
    updateUser(uid: any, doc: any): any;
    deleteUser(uid: any): any;
    createOrganization(oid: any, doc: any): any;
    getOrganization(oid: any): any;
    updateOrganization(oid: any, doc: any): any;
    deleteOrganization(oid: any): any;
    getRoles(uid: any, orgid: any, dbid: any): any;
    updateRoles(uids: any, orgid: any, dbid: any, actions: any): any;
}
declare namespace WOQLClient {
    export { CONST };
}
import ConnectionConfig = require("./connectionConfig");
import ConnectionCapabilities = require("./connectionCapabilities");
import CONST = require("./const");
