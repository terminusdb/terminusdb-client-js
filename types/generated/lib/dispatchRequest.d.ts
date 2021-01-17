export = DispatchRequest;
/**
 * @file Dispatch Request
 * @license Apache Version 2
 * @description Functions for dispatching API requests via the axios library.
 * @param {String} url  API endpoint URL
 * @param {String} action API action
 * @param {Object} payload data to be transmitted to endpoint
 * @param {String} key optional basic auth string to be passed
 */
declare function DispatchRequest(url: string, action: string, payload: any, local_auth: any, remote_auth?: any): any;
