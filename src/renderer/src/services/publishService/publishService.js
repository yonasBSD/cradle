import QueryString from 'qs';
import { authAxios } from '../axiosInstance/axiosInstance';

/**
 * Function to retrieve the preview of a publish report
 *
 * @param {Array<number>} noteIds - The ids of the notes to preview
 * @returns {Promise<AxiosResponse<any, any>>} - a JSON object containing the related entries, as well as the notes and their content
 */
export function getPublishData(noteIds) {
    const path = `/notes/publish/`;
    const queryParams = { note_ids: noteIds };

    return authAxios({
        method: 'GET',
        url: path,
        params: queryParams,
        paramsSerializer: (params) =>
            QueryString.stringify(params, { arrayFormat: 'repeat' }),
    });
}
