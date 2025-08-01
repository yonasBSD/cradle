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
import type { EdgeRelation } from './EdgeRelation';
import {
    EdgeRelationFromJSON,
    EdgeRelationFromJSONTyped,
    EdgeRelationToJSON,
    EdgeRelationToJSONTyped,
} from './EdgeRelation';
import type { EntryListCompressedTree } from './EntryListCompressedTree';
import {
    EntryListCompressedTreeFromJSON,
    EntryListCompressedTreeFromJSONTyped,
    EntryListCompressedTreeToJSON,
    EntryListCompressedTreeToJSONTyped,
} from './EntryListCompressedTree';

/**
 * 
 * @export
 * @interface SubGraph
 */
export interface SubGraph {
    /**
     * 
     * @type {EntryListCompressedTree}
     * @memberof SubGraph
     */
    entries: EntryListCompressedTree;
    /**
     * 
     * @type {Array<EdgeRelation>}
     * @memberof SubGraph
     */
    relations: Array<EdgeRelation>;
    /**
     * 
     * @type {{ [key: string]: any; }}
     * @memberof SubGraph
     */
    colors: { [key: string]: any; };
}

/**
 * Check if a given object implements the SubGraph interface.
 */
export function instanceOfSubGraph(value: object): value is SubGraph {
    if (!('entries' in value) || value['entries'] === undefined) return false;
    if (!('relations' in value) || value['relations'] === undefined) return false;
    if (!('colors' in value) || value['colors'] === undefined) return false;
    return true;
}

export function SubGraphFromJSON(json: any): SubGraph {
    return SubGraphFromJSONTyped(json, false);
}

export function SubGraphFromJSONTyped(json: any, ignoreDiscriminator: boolean): SubGraph {
    if (json == null) {
        return json;
    }
    return {
        
        'entries': EntryListCompressedTreeFromJSON(json['entries']),
        'relations': ((json['relations'] as Array<any>).map(EdgeRelationFromJSON)),
        'colors': json['colors'],
    };
}

export function SubGraphToJSON(json: any): SubGraph {
    return SubGraphToJSONTyped(json, false);
}

export function SubGraphToJSONTyped(value?: SubGraph | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'entries': EntryListCompressedTreeToJSON(value['entries']),
        'relations': ((value['relations'] as Array<any>).map(EdgeRelationToJSON)),
        'colors': value['colors'],
    };
}

