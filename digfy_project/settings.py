
from dotenv import load_dotenv
from pathlib import Path
from datetime import timedelta

load_dotenv()
# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# Quick-start development settings - unsuitable for production
# See https://docs.djangoproject.com/en/5.2/howto/deployment/checklist/

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = 'django-insecure-p!q)^^fc0%4+d73&6nr!3ndj+whe5!v3@=1h1n0$rwn(0^ln@n'

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = True

ALLOWED_HOSTS = [
    'localhost',
    '127.0.0.1',
    '2fd4-2404-7a80-a6e1-8600-5c62-20cf-6b9c-9e8d.ngrok-free.app',
]


# Application definition

INSTALLED_APPS = [
   'django.contrib.admin',              # 管理画面（/admin）を提供するアプリ
    'django.contrib.auth',              # ユーザー認証（ログイン/ログアウトなど）機能
    'django.contrib.contenttypes',      # モデルのコンテンツタイプを扱う仕組み
    'django.contrib.sessions',          # セッション管理（ログイン状態の保持など）
    'django.contrib.messages',          # 一時メッセージの仕組み
    'django.contrib.staticfiles',       # CSS・JSなど静的ファイルの取り扱い
    'visualizer',                       # アプリ（アーティスト可視化）
    'corsheaders',                      # CORS（他ドメインからのアクセス許可）設定用
    'rest_framework',                   # Django REST Framework（API構築用）
    'rest_framework_simplejwt',
]

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

CORS_ALLOW_ALL_ORIGINS = True

ROOT_URLCONF = 'digfy_project.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'digfy_project.wsgi.application'


# Database
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': BASE_DIR / 'db.sqlite3',
    }
}


# Password validation
# https://docs.djangoproject.com/en/5.2/ref/settings/#auth-password-validators

AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]


# Internationalization
# https://docs.djangoproject.com/en/5.2/topics/i18n/

LANGUAGE_CODE = 'en-us'

TIME_ZONE = 'UTC'

USE_I18N = True

USE_TZ = True


# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/

STATIC_URL = 'static/'

# Default primary key field type
# https://docs.djangoproject.com/en/5.2/ref/settings/#default-auto-field

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

# ログイン成功後にリダイレクトされるURL
LOGIN_REDIRECT_URL = '/'

# ログアウト後にリダイレクトされるURL
LOGOUT_REDIRECT_URL = '/'

CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",  # React dev server
]

SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=5),       # アクセストークン有効期間
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),         # リフレッシュトークン有効期間
    "ROTATE_REFRESH_TOKENS": False,                      # トークン更新時に新しいリフレッシュトークンを発行するか
    "BLACKLIST_AFTER_ROTATION": True,
    "AUTH_HEADER_TYPES": ("Bearer",),
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
}