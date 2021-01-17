export = ConnectionCapabilities;
/**
 * @file Connection Capabilities
 * @license Apache Version 2
 * @description Object which helps manage the capabilities available for a given TerminusDB connection
 * Creates an entry in the connection registry for the server
 * and all the databases that the client has access to
 * maps the input authorties to a per-db array for internal storage and easy
 * access control checks
 * @param {String} key API key
 */
declare function ConnectionCapabilities(): void;
declare class ConnectionCapabilities {
    databases: boolean;
    organizations: boolean;
    clear(): void;
    user: {};
    dbdocs: {};
    orgdocs: {};
    jsonld_context: any;
    systemdb_context: any;
    setCapabilities(connectjson: any): {};
    get_user(): {};
    author(): any;
    get_databases(): boolean;
    set_databases(newdbs: any): void;
    get_database(dbid: any, orgid: any): any;
    _databases_from_dbdocs(): {}[];
    set_roles(role_output: any): boolean;
    get_organizations(): boolean;
    set_organizations(orgs: any): void;
    get_organization(resname: any): any;
    _organizations_from_orgdocs(): any[];
    actions_permitted(actions: any, resnames: any): boolean;
    buildContextsFromPrefixes(): void;
    updateDatabasePrefixes(dbrec: any, newps: any): void;
    getContextForOutboundQuery(woql: any, dbid: any, orgid: any): {
        _: string;
    };
    _is_system_db(dbid: any): boolean;
    getJSONContext(): any;
    setJSONContext(ctxt: any): void;
    getSystemContext(): any;
    _roles_cover_resource_action(action: any, resname: any): boolean;
    _role_covers_resource_action(role: any, action: any, resname: any): boolean;
    _capability_covers_resource_action(cap: any, action: any, resname: any): boolean;
    _extract_user_info(connectjson: any): {
        label: any;
        comment: any;
    };
    _extract_user_role(jrole: any): {
        label: any;
        comment: any;
    };
    _extract_role_capability(jcap: any): {
        label: any;
        comment: any;
    };
    _extract_capability_resources(scope: any): any[];
    _extract_resource_name(jres: any): any;
    _extract_database(jres: any): {
        label: any;
        comment: any;
    };
    _get_db_rec(rec: any): {};
    _extract_database_organizations(): void;
    _extract_organization(jres: any): {
        label: any;
        comment: any;
    };
    _extract_multiple_ids(jres: any): any;
    _multiple_rdf_objects(rdf: any, type: any): {};
    _extract_rdf_object(type: any, rdf: any): {
        label: any;
        comment: any;
    };
    _extract_rdf_basics(rdf_json: any): {
        label: any;
        comment: any;
    };
    _single_rdf_value(pred: any, rdf: any): any;
    _multiple_rdf_values(pred: any, rdf: any): any[];
    _load_connection_context(ctxt: any): void;
}
