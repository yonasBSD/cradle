import MockAdapter from 'axios-mock-adapter';
import { getUploadLink, uploadFile, getDownloadLink } from './fileUploadService';

import { authAxios as axios, noAuthAxios } from '../axiosInstance/axiosInstance';

const mock = new MockAdapter(axios);
const noAuthMock = new MockAdapter(noAuthAxios);

describe('File Upload Service', () => {
    afterEach(() => {
        mock.reset();
    });

    it('should fetch a presigned URL for file upload', async () => {
        const fileName = 'file.txt';
        const expectedResponse = {
            presigned: 'http://presigned-url',
            bucket_name: 'bucket-name',
            minio_file_link: 'http://minio-file-link',
        };

        mock.onGet('/file-transfer/upload/').reply(200, expectedResponse);

        const response = await getUploadLink(fileName);

        expect(response.data).toEqual(expectedResponse);
        expect(mock.history.get[0].params.fileName).toBe(fileName);
    });

    it('should upload a file using a presigned URL', async () => {
        const uploadUrl = 'http://presigned-url';
        const file = new File(['file content'], 'file.txt', {
            type: 'text/plain',
        });
        const expectedResponse = { message: 'File uploaded successfully' };

        noAuthMock.onPut(uploadUrl).reply(200, expectedResponse);

        const response = await uploadFile(uploadUrl, file);

        expect(response.data).toEqual(expectedResponse);
        expect(noAuthMock.history.put[0].headers['Content-Type']).toBe(file.type);
        expect(noAuthMock.history.put[0].data).toBe(file);
    });

    it('should fetch a download link for a file', async () => {
        const path = 'http://minio-file-link';
        const expectedResponse = {
            downloadLink: 'http://download-link',
        };

        mock.onGet(path).reply(200, expectedResponse);

        const response = await getDownloadLink(path);

        expect(response.data).toEqual(expectedResponse);
    });

    it('should handle errors when fetching a download link', async () => {
        const path = 'http://minio-file-link';

        noAuthMock.onGet(path).reply(500);

        await expect(getDownloadLink(path)).rejects.toThrow();
    });
});
