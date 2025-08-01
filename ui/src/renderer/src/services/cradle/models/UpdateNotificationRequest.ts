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
 * @interface UpdateNotificationRequest
 */
export interface UpdateNotificationRequest {
    /**
     * 
     * @type {boolean}
     * @memberof UpdateNotificationRequest
     */
    isMarkedUnread: boolean;
}

/**
 * Check if a given object implements the UpdateNotificationRequest interface.
 */
export function instanceOfUpdateNotificationRequest(value: object): value is UpdateNotificationRequest {
    if (!('isMarkedUnread' in value) || value['isMarkedUnread'] === undefined) return false;
    return true;
}

export function UpdateNotificationRequestFromJSON(json: any): UpdateNotificationRequest {
    return UpdateNotificationRequestFromJSONTyped(json, false);
}

export function UpdateNotificationRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): UpdateNotificationRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'isMarkedUnread': json['is_marked_unread'],
    };
}

export function UpdateNotificationRequestToJSON(json: any): UpdateNotificationRequest {
    return UpdateNotificationRequestToJSONTyped(json, false);
}

export function UpdateNotificationRequestToJSONTyped(value?: UpdateNotificationRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'is_marked_unread': value['isMarkedUnread'],
    };
}

