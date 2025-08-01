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
 * @interface EditReportRequest
 */
export interface EditReportRequest {
    /**
     * List of note IDs to update the report with.
     * @type {Array<string>}
     * @memberof EditReportRequest
     */
    noteIds: Array<string>;
    /**
     * New title for the published report.
     * @type {string}
     * @memberof EditReportRequest
     */
    title: string;
}

/**
 * Check if a given object implements the EditReportRequest interface.
 */
export function instanceOfEditReportRequest(value: object): value is EditReportRequest {
    if (!('noteIds' in value) || value['noteIds'] === undefined) return false;
    if (!('title' in value) || value['title'] === undefined) return false;
    return true;
}

export function EditReportRequestFromJSON(json: any): EditReportRequest {
    return EditReportRequestFromJSONTyped(json, false);
}

export function EditReportRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): EditReportRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'noteIds': json['note_ids'],
        'title': json['title'],
    };
}

export function EditReportRequestToJSON(json: any): EditReportRequest {
    return EditReportRequestToJSONTyped(json, false);
}

export function EditReportRequestToJSONTyped(value?: EditReportRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'note_ids': value['noteIds'],
        'title': value['title'],
    };
}

