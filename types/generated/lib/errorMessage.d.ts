export function getErrorAsMessage(url: any, api: any, err: any): string;
export function getAPIErrorMessage(url: any, api: any, err: any): string;
export function getAccessDeniedMessage(url: any, api: any, err: any): string;
export function accessDenied(action: any, db: any, server: any): {
    status: number;
    url: any;
    type: string;
    action: any;
    body: string;
};
export function getInvalidURIMessage(url: any, call: any): string;
export function getInvalidParameterMessage(call: any, msg: any): string;
/**
 * Utility functions for generating and retrieving error messages
 * and storing error state
 */
export function parseAPIError(response: any): {
    status: any;
    type: any;
    body: any;
    url: any;
    headers: any;
    redirected: any;
};
