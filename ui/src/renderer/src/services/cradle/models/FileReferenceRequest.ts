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
 * @interface FileReferenceRequest
 */
export interface FileReferenceRequest {
    /**
     * 
     * @type {string}
     * @memberof FileReferenceRequest
     */
    id?: string;
    /**
     * 
     * @type {string}
     * @memberof FileReferenceRequest
     */
    minioFileName: string;
    /**
     * 
     * @type {string}
     * @memberof FileReferenceRequest
     */
    fileName: string;
    /**
     * 
     * @type {string}
     * @memberof FileReferenceRequest
     */
    bucketName: string;
}

/**
 * Check if a given object implements the FileReferenceRequest interface.
 */
export function instanceOfFileReferenceRequest(value: object): value is FileReferenceRequest {
    if (!('minioFileName' in value) || value['minioFileName'] === undefined) return false;
    if (!('fileName' in value) || value['fileName'] === undefined) return false;
    if (!('bucketName' in value) || value['bucketName'] === undefined) return false;
    return true;
}

export function FileReferenceRequestFromJSON(json: any): FileReferenceRequest {
    return FileReferenceRequestFromJSONTyped(json, false);
}

export function FileReferenceRequestFromJSONTyped(json: any, ignoreDiscriminator: boolean): FileReferenceRequest {
    if (json == null) {
        return json;
    }
    return {
        
        'id': json['id'] == null ? undefined : json['id'],
        'minioFileName': json['minio_file_name'],
        'fileName': json['file_name'],
        'bucketName': json['bucket_name'],
    };
}

export function FileReferenceRequestToJSON(json: any): FileReferenceRequest {
    return FileReferenceRequestToJSONTyped(json, false);
}

export function FileReferenceRequestToJSONTyped(value?: FileReferenceRequest | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {
        
        'id': value['id'],
        'minio_file_name': value['minioFileName'],
        'file_name': value['fileName'],
        'bucket_name': value['bucketName'],
    };
}

