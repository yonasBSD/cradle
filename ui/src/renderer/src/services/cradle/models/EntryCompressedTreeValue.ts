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

/**
 * @type EntryCompressedTreeValue
 * 
 * @export
 */
export type EntryCompressedTreeValue = string | { [key: string]: EntryCompressedTreeObjectValueValue; };

export function EntryCompressedTreeValueFromJSON(json: any): EntryCompressedTreeValue {
    return EntryCompressedTreeValueFromJSONTyped(json, false);
}

export function EntryCompressedTreeValueFromJSONTyped(json: any, ignoreDiscriminator: boolean): EntryCompressedTreeValue {
    if (json == null) {
        return json;
    }

    return {} as any;
}

export function EntryCompressedTreeValueToJSON(json: any): any {
    return EntryCompressedTreeValueToJSONTyped(json, false);
}

export function EntryCompressedTreeValueToJSONTyped(value?: EntryCompressedTreeValue | null, ignoreDiscriminator: boolean = false): any {
    if (value == null) {
        return value;
    }

    return {};
}

