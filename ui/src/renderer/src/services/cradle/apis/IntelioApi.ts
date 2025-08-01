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


import * as runtime from '../runtime';
import type {
  BaseDigest,
  DigestSubclass,
  EnrichmentSettings,
  EnrichmentSubclass,
  MappingSubclass,
  PaginatedBaseDigestSerializerResponse,
} from '../models/index';
import {
    BaseDigestFromJSON,
    BaseDigestToJSON,
    DigestSubclassFromJSON,
    DigestSubclassToJSON,
    EnrichmentSettingsFromJSON,
    EnrichmentSettingsToJSON,
    EnrichmentSubclassFromJSON,
    EnrichmentSubclassToJSON,
    MappingSubclassFromJSON,
    MappingSubclassToJSON,
    PaginatedBaseDigestSerializerResponseFromJSON,
    PaginatedBaseDigestSerializerResponseToJSON,
} from '../models/index';

export interface EnrichmentSettingsRetrieveRequest {
    enricherType: string;
}

export interface EnrichmentSettingsUpdateRequest {
    enricherType: string;
    enricherType2: string;
    id?: string;
    strategy?: EnrichmentSettingsUpdateStrategyEnum;
    enabled?: boolean;
    periodicity?: string;
    forEclasses?: Array<string>;
    settings?: any | null;
}

export interface IntelioDigestCreateRequest {
    title: string;
    digestType: string;
    file: Blob;
    entity?: number;
}

export interface IntelioDigestRetrieveRequest {
    author?: string;
    createdAtGte?: string;
    createdAtLte?: string;
    createdDate?: string;
    title?: string;
}

export interface MappingsKeysSchemaRequest {
    className: string;
}

export interface MappingsSchemaCreateOrUpdateRequest {
    className: string;
}

export interface MappingsSchemaDestroyRequest {
    className: string;
}

export interface MappingsSchemaListRequest {
    className: string;
}

/**
 * 
 */
export class IntelioApi extends runtime.BaseAPI {

    /**
     * Get enrichment settings for a specific enricher type.
     * Get enrichment settings
     */
    async enrichmentSettingsRetrieveRaw(requestParameters: EnrichmentSettingsRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<EnrichmentSettings>> {
        if (requestParameters['enricherType'] == null) {
            throw new runtime.RequiredError(
                'enricherType',
                'Required parameter "enricherType" was null or undefined when calling enrichmentSettingsRetrieve().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Api-Key"] = await this.configuration.apiKey("Api-Key"); // ApiKey authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/intelio/enrichment/{enricher_type}/`;
        urlPath = urlPath.replace(`{${"enricher_type"}}`, encodeURIComponent(String(requestParameters['enricherType'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => EnrichmentSettingsFromJSON(jsonValue));
    }

    /**
     * Get enrichment settings for a specific enricher type.
     * Get enrichment settings
     */
    async enrichmentSettingsRetrieve(requestParameters: EnrichmentSettingsRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<EnrichmentSettings> {
        const response = await this.enrichmentSettingsRetrieveRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Create or update enrichment settings for a specific enricher type.
     * Update enrichment settings
     */
    async enrichmentSettingsUpdateRaw(requestParameters: EnrichmentSettingsUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<EnrichmentSettings>> {
        if (requestParameters['enricherType'] == null) {
            throw new runtime.RequiredError(
                'enricherType',
                'Required parameter "enricherType" was null or undefined when calling enrichmentSettingsUpdate().'
            );
        }

        if (requestParameters['enricherType2'] == null) {
            throw new runtime.RequiredError(
                'enricherType2',
                'Required parameter "enricherType2" was null or undefined when calling enrichmentSettingsUpdate().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Api-Key"] = await this.configuration.apiKey("Api-Key"); // ApiKey authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const consumes: runtime.Consume[] = [
            { contentType: 'application/x-www-form-urlencoded' },
            { contentType: 'multipart/form-data' },
            { contentType: 'application/json' },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters['id'] != null) {
            formParams.append('id', requestParameters['id'] as any);
        }

        if (requestParameters['strategy'] != null) {
            formParams.append('strategy', requestParameters['strategy'] as any);
        }

        if (requestParameters['enabled'] != null) {
            formParams.append('enabled', requestParameters['enabled'] as any);
        }

        if (requestParameters['periodicity'] != null) {
            formParams.append('periodicity', requestParameters['periodicity'] as any);
        }

        if (requestParameters['forEclasses'] != null) {
            formParams.append('for_eclasses', requestParameters['forEclasses']!.join(runtime.COLLECTION_FORMATS["csv"]));
        }

        if (requestParameters['enricherType2'] != null) {
            formParams.append('enricher_type', requestParameters['enricherType2'] as any);
        }

        if (requestParameters['settings'] != null) {
            formParams.append('settings', new Blob([JSON.stringify(EnrichmentSettingsToJSON(requestParameters['settings']))], { type: "application/json", }));
                    }


        let urlPath = `/intelio/enrichment/{enricher_type}/`;
        urlPath = urlPath.replace(`{${"enricher_type"}}`, encodeURIComponent(String(requestParameters['enricherType'])));

        const response = await this.request({
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => EnrichmentSettingsFromJSON(jsonValue));
    }

    /**
     * Create or update enrichment settings for a specific enricher type.
     * Update enrichment settings
     */
    async enrichmentSettingsUpdate(requestParameters: EnrichmentSettingsUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<EnrichmentSettings> {
        const response = await this.enrichmentSettingsUpdateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Returns a list of all subclasses of BaseEnricher with their names.
     * Get enrichment subclasses
     */
    async enrichmentSubclassesListRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<EnrichmentSubclass>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/intelio/enrichment/`;

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(EnrichmentSubclassFromJSON));
    }

    /**
     * Returns a list of all subclasses of BaseEnricher with their names.
     * Get enrichment subclasses
     */
    async enrichmentSubclassesList(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<EnrichmentSubclass>> {
        const response = await this.enrichmentSubclassesListRaw(initOverrides);
        return await response.value();
    }

    /**
     * Create a new digest for the current user with file upload.
     * Create digest
     */
    async intelioDigestCreateRaw(requestParameters: IntelioDigestCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<BaseDigest>> {
        if (requestParameters['title'] == null) {
            throw new runtime.RequiredError(
                'title',
                'Required parameter "title" was null or undefined when calling intelioDigestCreate().'
            );
        }

        if (requestParameters['digestType'] == null) {
            throw new runtime.RequiredError(
                'digestType',
                'Required parameter "digestType" was null or undefined when calling intelioDigestCreate().'
            );
        }

        if (requestParameters['file'] == null) {
            throw new runtime.RequiredError(
                'file',
                'Required parameter "file" was null or undefined when calling intelioDigestCreate().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Api-Key"] = await this.configuration.apiKey("Api-Key"); // ApiKey authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }
        const consumes: runtime.Consume[] = [
            { contentType: 'multipart/form-data' },
        ];
        // @ts-ignore: canConsumeForm may be unused
        const canConsumeForm = runtime.canConsumeForm(consumes);

        let formParams: { append(param: string, value: any): any };
        let useForm = false;
        // use FormData to transmit files using content-type "multipart/form-data"
        useForm = canConsumeForm;
        if (useForm) {
            formParams = new FormData();
        } else {
            formParams = new URLSearchParams();
        }

        if (requestParameters['title'] != null) {
            formParams.append('title', requestParameters['title'] as any);
        }

        if (requestParameters['digestType'] != null) {
            formParams.append('digest_type', requestParameters['digestType'] as any);
        }

        if (requestParameters['entity'] != null) {
            formParams.append('entity', requestParameters['entity'] as any);
        }

        if (requestParameters['file'] != null) {
            formParams.append('file', requestParameters['file'] as any);
        }


        let urlPath = `/intelio/digest/`;

        const response = await this.request({
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
            body: formParams,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => BaseDigestFromJSON(jsonValue));
    }

    /**
     * Create a new digest for the current user with file upload.
     * Create digest
     */
    async intelioDigestCreate(requestParameters: IntelioDigestCreateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<BaseDigest> {
        const response = await this.intelioDigestCreateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete a specific digest by ID. Requires a query parameter: ?id=<digest_id>
     */
    async intelioDigestDestroyRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<void>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Api-Key"] = await this.configuration.apiKey("Api-Key"); // ApiKey authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/intelio/digest/`;

        const response = await this.request({
            path: urlPath,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.VoidApiResponse(response);
    }

    /**
     * Delete a specific digest by ID. Requires a query parameter: ?id=<digest_id>
     */
    async intelioDigestDestroy(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<void> {
        await this.intelioDigestDestroyRaw(initOverrides);
    }

    /**
     * Returns a list of all subclasses of BaseDigest with their names.
     * Get digest subclasses
     */
    async intelioDigestOptionsListRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<DigestSubclass>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Api-Key"] = await this.configuration.apiKey("Api-Key"); // ApiKey authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/intelio/digest/options/`;

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(DigestSubclassFromJSON));
    }

    /**
     * Returns a list of all subclasses of BaseDigest with their names.
     * Get digest subclasses
     */
    async intelioDigestOptionsList(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<DigestSubclass>> {
        const response = await this.intelioDigestOptionsListRaw(initOverrides);
        return await response.value();
    }

    /**
     * Create and retrieve digests for the current user.
     * Manage digests
     */
    async intelioDigestRetrieveRaw(requestParameters: IntelioDigestRetrieveRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<PaginatedBaseDigestSerializerResponse>> {
        const queryParameters: any = {};

        if (requestParameters['author'] != null) {
            queryParameters['author'] = requestParameters['author'];
        }

        if (requestParameters['createdAtGte'] != null) {
            queryParameters['created_at_gte'] = requestParameters['createdAtGte'];
        }

        if (requestParameters['createdAtLte'] != null) {
            queryParameters['created_at_lte'] = requestParameters['createdAtLte'];
        }

        if (requestParameters['createdDate'] != null) {
            queryParameters['created_date'] = requestParameters['createdDate'];
        }

        if (requestParameters['title'] != null) {
            queryParameters['title'] = requestParameters['title'];
        }

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Api-Key"] = await this.configuration.apiKey("Api-Key"); // ApiKey authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/intelio/digest/`;

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => PaginatedBaseDigestSerializerResponseFromJSON(jsonValue));
    }

    /**
     * Create and retrieve digests for the current user.
     * Manage digests
     */
    async intelioDigestRetrieve(requestParameters: IntelioDigestRetrieveRequest = {}, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<PaginatedBaseDigestSerializerResponse> {
        const response = await this.intelioDigestRetrieveRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Given a class name, return the possible field mappings.
     * Get mapping keys schema
     */
    async mappingsKeysSchemaRaw(requestParameters: MappingsKeysSchemaRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<object>> {
        if (requestParameters['className'] == null) {
            throw new runtime.RequiredError(
                'className',
                'Required parameter "className" was null or undefined when calling mappingsKeysSchema().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Api-Key"] = await this.configuration.apiKey("Api-Key"); // ApiKey authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/intelio/mappings/{class_name}/keys`;
        urlPath = urlPath.replace(`{${"class_name"}}`, encodeURIComponent(String(requestParameters['className'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse<any>(response);
    }

    /**
     * Given a class name, return the possible field mappings.
     * Get mapping keys schema
     */
    async mappingsKeysSchema(requestParameters: MappingsKeysSchemaRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<object> {
        const response = await this.mappingsKeysSchemaRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Create a new mapping or update an existing one for a given class.
     * Create or update mapping
     */
    async mappingsSchemaCreateOrUpdateRaw(requestParameters: MappingsSchemaCreateOrUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<object>> {
        if (requestParameters['className'] == null) {
            throw new runtime.RequiredError(
                'className',
                'Required parameter "className" was null or undefined when calling mappingsSchemaCreateOrUpdate().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Api-Key"] = await this.configuration.apiKey("Api-Key"); // ApiKey authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/intelio/mappings/{class_name}/`;
        urlPath = urlPath.replace(`{${"class_name"}}`, encodeURIComponent(String(requestParameters['className'])));

        const response = await this.request({
            path: urlPath,
            method: 'POST',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse<any>(response);
    }

    /**
     * Create a new mapping or update an existing one for a given class.
     * Create or update mapping
     */
    async mappingsSchemaCreateOrUpdate(requestParameters: MappingsSchemaCreateOrUpdateRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<object> {
        const response = await this.mappingsSchemaCreateOrUpdateRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Delete a mapping instance for a given class.
     * Delete mapping
     */
    async mappingsSchemaDestroyRaw(requestParameters: MappingsSchemaDestroyRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<any>> {
        if (requestParameters['className'] == null) {
            throw new runtime.RequiredError(
                'className',
                'Required parameter "className" was null or undefined when calling mappingsSchemaDestroy().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Api-Key"] = await this.configuration.apiKey("Api-Key"); // ApiKey authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/intelio/mappings/{class_name}/`;
        urlPath = urlPath.replace(`{${"class_name"}}`, encodeURIComponent(String(requestParameters['className'])));

        const response = await this.request({
            path: urlPath,
            method: 'DELETE',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        if (this.isJsonMime(response.headers.get('content-type'))) {
            return new runtime.JSONApiResponse<any>(response);
        } else {
            return new runtime.TextApiResponse(response) as any;
        }
    }

    /**
     * Delete a mapping instance for a given class.
     * Delete mapping
     */
    async mappingsSchemaDestroy(requestParameters: MappingsSchemaDestroyRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<any> {
        const response = await this.mappingsSchemaDestroyRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Get all mapping instances for a given class.
     * Get mapping instances
     */
    async mappingsSchemaListRaw(requestParameters: MappingsSchemaListRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<object>>> {
        if (requestParameters['className'] == null) {
            throw new runtime.RequiredError(
                'className',
                'Required parameter "className" was null or undefined when calling mappingsSchemaList().'
            );
        }

        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.apiKey) {
            headerParameters["Api-Key"] = await this.configuration.apiKey("Api-Key"); // ApiKey authentication
        }

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/intelio/mappings/{class_name}/`;
        urlPath = urlPath.replace(`{${"class_name"}}`, encodeURIComponent(String(requestParameters['className'])));

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse<any>(response);
    }

    /**
     * Get all mapping instances for a given class.
     * Get mapping instances
     */
    async mappingsSchemaList(requestParameters: MappingsSchemaListRequest, initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<object>> {
        const response = await this.mappingsSchemaListRaw(requestParameters, initOverrides);
        return await response.value();
    }

    /**
     * Returns a list of all subclasses of ClassMapping with their names.
     * Get class mapping subclasses
     */
    async mappingsSubclassesListRaw(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<runtime.ApiResponse<Array<MappingSubclass>>> {
        const queryParameters: any = {};

        const headerParameters: runtime.HTTPHeaders = {};

        if (this.configuration && this.configuration.accessToken) {
            const token = this.configuration.accessToken;
            const tokenString = await token("jwtAuth", []);

            if (tokenString) {
                headerParameters["Authorization"] = `Bearer ${tokenString}`;
            }
        }

        let urlPath = `/intelio/mappings/`;

        const response = await this.request({
            path: urlPath,
            method: 'GET',
            headers: headerParameters,
            query: queryParameters,
        }, initOverrides);

        return new runtime.JSONApiResponse(response, (jsonValue) => jsonValue.map(MappingSubclassFromJSON));
    }

    /**
     * Returns a list of all subclasses of ClassMapping with their names.
     * Get class mapping subclasses
     */
    async mappingsSubclassesList(initOverrides?: RequestInit | runtime.InitOverrideFunction): Promise<Array<MappingSubclass>> {
        const response = await this.mappingsSubclassesListRaw(initOverrides);
        return await response.value();
    }

}

/**
 * @export
 */
export const EnrichmentSettingsUpdateStrategyEnum = {
    Manual: 'manual',
    OnCreate: 'on_create',
    Periodic: 'periodic'
} as const;
export type EnrichmentSettingsUpdateStrategyEnum = typeof EnrichmentSettingsUpdateStrategyEnum[keyof typeof EnrichmentSettingsUpdateStrategyEnum];
