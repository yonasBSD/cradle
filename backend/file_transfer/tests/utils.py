from django.test import TestCase
from unittest.mock import patch
from ..exceptions import MinioObjectNotFound
from datetime import timedelta


class FileTransferTestCase(TestCase):
    def setUp(self):
        self.success_logger_patcher = patch("logs.utils.success_logger")
        self.error_logger_patcher = patch("logs.utils.error_logger")

        self.mocked_success_logger = self.success_logger_patcher.start()
        self.mocked_error_logger = self.error_logger_patcher.start()

    def tearDown(self):
        self.success_logger_patcher.stop()
        self.error_logger_patcher.stop()

    def init_minio_constants(self):
        self.file_name = "evidence.png"
        self.expiry_time = timedelta(minutes=5)
        self.minio_file_name = "aad5cae6-5737-409d-8ce2-5f116ed5e2de-evidence.png"
        self.presigned_url = (
            "http://127.0.0.1:9000/user/aad5cae6-5737-409d-8ce2-5f116ed5e2de"
            "-evidence.png?"
            "X-Amz-Algorithm=AWS4-HMAC-SHA256&"
            "X-Amz-Credential=minioadmin%2F20240603%2Fus-east-1%2Fs3%2Faws4_request&"
            "X-Amz-Date=20240603T131058Z&"
            "X-Amz-Expires=300&"
            "X-Amz-SignedHeaders=host&"
            "X-Amz-Signature=f06e8fe9c09017d64e2704e243deafec42ecd44a177c5a2e41e"
            "be40d57a372a8"
        )
        self.uuid = "aad5cae6-5737-409d-8ce2-5f116ed5e2de"

    def mock_minio_client_create(self):
        self.init_minio_constants()

        def mocked_presigned_get_call(
            bucket_name, minio_file_name, expiry_time, **kwargs
        ):
            if (
                bucket_name == self.bucket_name
                and minio_file_name == self.minio_file_name
            ):
                return self.presigned_url
            else:
                raise MinioObjectNotFound()

        self.patcher_bucket = patch(
            "file_transfer.utils.MinioClient.create_user_bucket"
        )
        self.patcher_put = patch("file_transfer.utils.MinioClient.create_presigned_put")
        self.patcher_get = patch("file_transfer.utils.MinioClient.create_presigned_get")

        self.mocked_create_user_bucket = self.patcher_bucket.start()
        self.mocked_presigned_put = self.patcher_put.start()
        self.mocked_presigned_get = self.patcher_get.start()

        self.mocked_presigned_put.return_value = (
            self.minio_file_name,
            self.presigned_url,
        )
        self.mocked_presigned_get.side_effect = mocked_presigned_get_call

    def mock_minio_client_destroy(self):
        self.patcher_put.stop()
        self.patcher_get.stop()
        self.patcher_bucket.stop()

    def mock_minio_create(self):
        self.init_minio_constants()

        self.patcher_bucket = patch("minio.Minio.make_bucket")
        self.patcher_put = patch("minio.Minio.presigned_put_object")
        self.patcher_get = patch("minio.Minio.presigned_get_object")
        self.patcher_stat_object = patch("minio.Minio.stat_object")
        self.patcher_uuid = patch("uuid.uuid4")

        self.mocked_make_bucket = self.patcher_bucket.start()
        self.mocked_presigned_put = self.patcher_put.start()
        self.mocked_presigned_get = self.patcher_get.start()
        self.mocked_stat_object = self.patcher_stat_object.start()
        self.mocked_uuid = self.patcher_uuid.start()

        self.mocked_presigned_put.return_value = self.presigned_url
        self.mocked_uuid.return_value = self.uuid

        def mocked_presigned_get_call(bucket_name, minio_file_name, expires, **kwargs):
            if (
                bucket_name == self.bucket_name
                and minio_file_name == self.minio_file_name
            ):
                return self.presigned_url
            else:
                raise Exception()

        def mocked_stat_object_call(bucket_name, object_name):
            if bucket_name == self.bucket_name and object_name == self.minio_file_name:
                return True
            else:
                raise Exception()

        self.mocked_presigned_get.side_effect = mocked_presigned_get_call
        self.mocked_stat_object.side_effect = mocked_stat_object_call

    def mock_minio_destroy(self):
        self.patcher_put.stop()
        self.patcher_get.stop()
        self.patcher_bucket.stop()
        self.patcher_stat_object.stop()
        self.patcher_uuid.stop()
