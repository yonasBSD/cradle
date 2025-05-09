from .settings_common import *  # noqa:F401

SECRET_KEY = "django-insecure-0in+njnc5mjf3xuh$yjy+$s@78-!9rh$qjzv@aqw+*c$zh&d*&"

DEBUG = True

ALLOWED_HOSTS = ["localhost", "127.0.0.1"]

CSRF_TRUSTED_ORIGINS = ["http://localhost", "http://127.0.0.1"]

DATABASES = {
    "default": {
        "ENGINE": "django.contrib.gis.db.backends.postgis",
        "NAME": "cradledb",
        "USER": "postgres",
        "PASSWORD": "postgres",
        "HOST": "postgres",
        "PORT": "5432",
    }
}

MINIO_CONFIG = {
    "endpoint": "",
    "access_key": "",
    "secret_key": "",
    "secure": False,
}

BASE_URL = ""
STATIC_URL = "static/"
FRONTEND_URL = "http://localhost:5173"


RESULT_BACKEND = "redis://redis:6379/0"
REDIS_URL = "redis://redis:6379/0"
BROKER = REDIS_URL
RESULT_BACKEND = REDIS_URL

EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = ""
EMAIL_PORT = 587
EMAIL_HOST_USER = ""
DEFAULT_FROM_EMAIL = ""
EMAIL_HOST_PASSWORD = None
EMAIL_USE_TLS = True


DEFAULT_SETTINGS = {
    "users": {
        "allow_registration": True,
        "require_admin_confirmation": False,
        "require_email_confirmation": False,
    },
}
