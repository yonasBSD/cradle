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
 * @interface EdgeRelation
 */
export interface EdgeRelation {
    /**
     * 
     * @type {string}
     * @memberof EdgeRelation
     */
    id: string;
    /**
     * 
     * @type {number}
     * @memberof EdgeRelation
     */
    src: number;
    /**
     * 
     * @type {number}
     * @memberof EdgeRelation
     */
    dst: number;
    /**
     * 
     * @type {Date}
     * @memberof EdgeRelation
     */
    createdAt: Date;
    /**
     * 
     * @type {Date}
     * @memberof EdgeRelation
     */
    lastSeen: Date;
}

/**
 * Check if a given object implements the EdgeRelation interface.
 */
export function instanceOfEdgeRelation(value: object): value is EdgeRelation {
    if (!('id' in value) || value['id'] === undefined) return false;
    if (!('src' in value) || value['src'] === undefined) return false;
    if (!('dst' in value) || value['dst'] === undefined) return false;
    if (!('createdAt' in value) || value['createdAt'] === undefined) return false;
    if (!('lastSeen' in value) || value['lastSeen'] === undefined) return false;
    return true;
}

export function EdgeRelationFromJSON(json: any): EdgeRelation {
    return EdgeRelationFromJSONTyped(json, false);
}

export function EdgeRelationFromJSONTyped(json: any, ignoreDiscriminator: boolean): EdgeRelation {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'],
        'src': json['src'],
        'dst': json['dst'],
        'createdAt': (new Date(json['created_at'])),
        'lastSeen': (new Date(json['last_seen'])),
    };
}

export function EdgeRelationToJSON(json: any): EdgeRelation {
    return EdgeRelationToJSONTyped(json, false);
}

export function EdgeRelationToJSONTyped(value?: EdgeRelation | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'src': value['src'],
        'dst': value['dst'],
        'created_at': ((value['createdAt']).toISOString()),
        'last_seen': ((value['lastSeen']).toISOString()),
    };
}

