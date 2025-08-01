/* tslint:disable */
/* eslint-disable */
/**
 * CRADLE
 * Threat Intelligence Knowledge Management
 *
 * The version of the OpenAPI document: 2.8.0 (2.8.0)
 * 
 *
 * NOTE: This class is auto generated by OpenAPI Generator (https://openapi-generator.tech).
 * https://openapi-generator.tech
 * Do not edit the class manually.
 */

import { mapValues } from '../runtime';
/**
 * 
 * @export
 * @interface AccessRequest
 */
export interface AccessRequest {
    /**
     * * `none` - none
     * * `read` - read
     * * `read-write` - read-write
     * @type {string}
     * @memberof AccessRequest
     */
    accessType: AccessRequestAccessTypeEnum;
}


/**
 * @export
 */
export const AccessRequestAccessTypeEnum = {
    None: 'none',
    Read: 'read',
    ReadWrite: 'read-write'
} as const;
export type AccessRequestAccessTypeEnum = typeof AccessRequestAccessTypeEnum[keyof typeof AccessRequestAccessTypeEnum];


/**
 * Check if a given object implements the AccessRequest interface.
 */
export function instanceOfAccessRequest(value: object): value is AccessRequest {
    if (!('accessType' in value) || value['accessType'] === undefined) return false;
    return true;
}

export function AccessRequestFromJSON(json: any): AccessRequest {
    return AccessRequestFromJSONTyped(json, false);
}

export function AccessRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): AccessRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'accessType': json['access_type'],
    };
}

export function AccessRequestToJSON(json: any): AccessRequest {
    return AccessRequestToJSONTyped(json, false);
}

export function AccessRequestToJSONTyped(value?: AccessRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'access_type': value['accessType'],
    };
}

