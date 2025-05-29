from dotenv import load_dotenv
from pathlib import Path
from datetime import timedelta
import dj_database_url
import os



# プロジェクトのベースディレクトリ
BASE_DIR = Path(__file__).resolve().parent.parent

# .env 読み込み
load_dotenv(BASE_DIR / ".env")



# =======================
# セキュリティ設定
# =======================


DEBUG = os.getenv("DEBUG", "False") == "True"
SECRET_KEY = os.getenv("SECRET_KEY")
ALLOWED_HOSTS = os.getenv("ALLOWED_HOSTS", "").split(",")

# =======================
# アプリケーション設定
# =======================

INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # 自作アプリ
    "visualizer",

    # サードパーティ
    "rest_framework",
    "rest_framework_simplejwt",
    "corsheaders",
]

MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",  # 一番上が推奨
    "django.middleware.security.SecurityMiddleware",
    "django.contrib.sessions.middleware.SessionMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "digfy_project.urls"

# =======================
# テンプレート設定（管理画面用）
# =======================

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],  # カスタムテンプレートフォルダを追加したい場合はここにパスを入れる
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',  # ← admin動作に必要
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = "digfy_project.wsgi.application"

# =======================
# データベース設定
# =======================

if os.getenv("RENDER") == "true":
    DATABASES = {
        "default": dj_database_url.config(
            default=os.getenv("DATABASE_URL")
        )
    }
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.sqlite3",
            "NAME": BASE_DIR / "db.sqlite3",
        }
    }
# =======================
# 認証・JWT設定
# =======================

REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": (
        "rest_framework_simplejwt.authentication.JWTAuthentication",
    ),
}

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    "ROTATE_REFRESH_TOKENS": False,
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}

# =======================
# CORS設定
# =======================

CORS_ALLOW_ALL_ORIGINS = DEBUG  # 本番はFalseにして下で明示許可

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # ローカル開発用
    "https://digfy.onrender.com",  # ← Render frontend URL
]

# =======================
# 静的ファイル
# =======================

STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "staticfiles")  # collectstatic用

# =======================
# 国際化
# =======================

LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# =======================
# ログイン関連
# =======================

LOGIN_REDIRECT_URL = "/"
LOGOUT_REDIRECT_URL = "/"

# =======================
# その他
# =======================

DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"
