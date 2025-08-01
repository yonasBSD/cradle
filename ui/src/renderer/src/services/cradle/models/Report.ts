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
 * @interface Report
 */
export interface Report {
    /**
     * 
     * @type {string}
     * @memberof Report
     */
    readonly id?: string;
    /**
     * 
     * @type {string}
     * @memberof Report
     */
    title?: string;
    /**
     * * `working` - Working
     * * `done` - Done
     * * `error` - Error
     * @type {string}
     * @memberof Report
     */
    status?: ReportStatusEnum;
    /**
     * 
     * @type {boolean}
     * @memberof Report
     */
    anonymized?: boolean;
    /**
     * 
     * @type {Date}
     * @memberof Report
     */
    readonly createdAt?: Date;
    /**
     * * `catalyst` - Catalyst
     * * `html` - HTML
     * * `plain` - Plain Text
     * * `json` - JSON
     * @type {string}
     * @memberof Report
     */
    strategy: ReportStrategyEnum;
    /**
     * 
     * @type {string}
     * @memberof Report
     */
    readonly strategyLabel?: string;
    /**
     * 
     * @type {string}
     * @memberof Report
     */
    readonly reportUrl?: string | null;
    /**
     * 
     * @type {string}
     * @memberof Report
     */
    errorMessage?: string | null;
    /**
     * 
     * @type {Array<string>}
     * @memberof Report
     */
    readonly noteIds?: Array<string>;
    /**
     * 
     * @type {any}
     * @memberof Report
     */
    extraData?: any | null;
}


/**
 * @export
 */
export const ReportStatusEnum = {
    Working: 'working',
    Done: 'done',
    Error: 'error'
} as const;
export type ReportStatusEnum = typeof ReportStatusEnum[keyof typeof ReportStatusEnum];

/**
 * @export
 */
export const ReportStrategyEnum = {
    Catalyst: 'catalyst',
    Html: 'html',
    Plain: 'plain',
    Json: 'json'
} as const;
export type ReportStrategyEnum = typeof ReportStrategyEnum[keyof typeof ReportStrategyEnum];


/**
 * Check if a given object implements the Report interface.
 */
export function instanceOfReport(value: object): value is Report {
    if (!('strategy' in value) || value['strategy'] === undefined) return false;
    return true;
}

export function ReportFromJSON(json: any): Report {
    return ReportFromJSONTyped(json, false);
}

export function ReportFromJSONTyped(json: any, ignoreDiscriminator: boolean): Report {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'title': json['title'] == null ? undefined : json['title'],
        'status': json['status'] == null ? undefined : json['status'],
        'anonymized': json['anonymized'] == null ? undefined : json['anonymized'],
        'createdAt': json['created_at'] == null ? undefined : (new Date(json['created_at'])),
        'strategy': json['strategy'],
        'strategyLabel': json['strategy_label'] == null ? undefined : json['strategy_label'],
        'reportUrl': json['report_url'] == null ? undefined : json['report_url'],
        'errorMessage': json['error_message'] == null ? undefined : json['error_message'],
        'noteIds': json['note_ids'] == null ? undefined : json['note_ids'],
        'extraData': json['extra_data'] == null ? undefined : json['extra_data'],
    };
}

export function ReportToJSON(json: any): Report {
    return ReportToJSONTyped(json, false);
}

export function ReportToJSONTyped(value?: Omit<Report, 'id'|'created_at'|'strategy_label'|'report_url'|'note_ids'> | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'title': value['title'],
        'status': value['status'],
        'anonymized': value['anonymized'],
        'strategy': value['strategy'],
        'error_message': value['errorMessage'],
        'extra_data': value['extraData'],
    };
}

