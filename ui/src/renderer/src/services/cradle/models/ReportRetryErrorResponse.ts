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
 * Serializer for report retry error responses.
 * @export
 * @interface ReportRetryErrorResponse
 */
export interface ReportRetryErrorResponse {
    /**
     * Error detail message
     * @type {string}
     * @memberof ReportRetryErrorResponse
     */
    detail: string;
}

/**
 * Check if a given object implements the ReportRetryErrorResponse interface.
 */
export function instanceOfReportRetryErrorResponse(value: object): value is ReportRetryErrorResponse {
    if (!('detail' in value) || value['detail'] === undefined) return false;
    return true;
}

export function ReportRetryErrorResponseFromJSON(json: any): ReportRetryErrorResponse {
    return ReportRetryErrorResponseFromJSONTyped(json, false);
}

export function ReportRetryErrorResponseFromJSONTyped(json: any, ignoreDiscriminator: boolean): ReportRetryErrorResponse {
    if (json == null) {
        return json;
    }
    return {
        
        'detail': json['detail'],
    };
}

export function ReportRetryErrorResponseToJSON(json: any): ReportRetryErrorResponse {
    return ReportRetryErrorResponseToJSONTyped(json, false);
}

export function ReportRetryErrorResponseToJSONTyped(value?: ReportRetryErrorResponse | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'detail': value['detail'],
    };
}

