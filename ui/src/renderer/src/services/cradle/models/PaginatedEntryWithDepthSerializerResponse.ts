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
import type { EntryWithDepth } from './EntryWithDepth';
import {
    EntryWithDepthFromJSON,
    EntryWithDepthFromJSONTyped,
    EntryWithDepthToJSON,
    EntryWithDepthToJSONTyped,
} from './EntryWithDepth';

/**
 * 
 * @export
 * @interface PaginatedEntryWithDepthSerializerResponse
 */
export interface PaginatedEntryWithDepthSerializerResponse {
    /**
     * Current page number
     * @type {number}
     * @memberof PaginatedEntryWithDepthSerializerResponse
     */
    page: number;
    /**
     * Whether there are more pages available
     * @type {boolean}
     * @memberof PaginatedEntryWithDepthSerializerResponse
     */
    hasNext: boolean;
    /**
     * 
     * @type {Array<EntryWithDepth>}
     * @memberof PaginatedEntryWithDepthSerializerResponse
     */
    results: Array<EntryWithDepth>;
}

/**
 * Check if a given object implements the PaginatedEntryWithDepthSerializerResponse interface.
 */
export function instanceOfPaginatedEntryWithDepthSerializerResponse(value: object): value is PaginatedEntryWithDepthSerializerResponse {
    if (!('page' in value) || value['page'] === undefined) return false;
    if (!('hasNext' in value) || value['hasNext'] === undefined) return false;
    if (!('results' in value) || value['results'] === undefined) return false;
    return true;
}

export function PaginatedEntryWithDepthSerializerResponseFromJSON(json: any): PaginatedEntryWithDepthSerializerResponse {
    return PaginatedEntryWithDepthSerializerResponseFromJSONTyped(json, false);
}

export function PaginatedEntryWithDepthSerializerResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): PaginatedEntryWithDepthSerializerResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'page': json['page'],
        'hasNext': json['has_next'],
        'results': ((json['results'] as Array<any>).map(EntryWithDepthFromJSON)),
    };
}

export function PaginatedEntryWithDepthSerializerResponseToJSON(json: any): PaginatedEntryWithDepthSerializerResponse {
    return PaginatedEntryWithDepthSerializerResponseToJSONTyped(json, false);
}

export function PaginatedEntryWithDepthSerializerResponseToJSONTyped(value?: PaginatedEntryWithDepthSerializerResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'page': value['page'],
        'has_next': value['hasNext'],
        'results': ((value['results'] as Array<any>).map(EntryWithDepthToJSON)),
    };
}

