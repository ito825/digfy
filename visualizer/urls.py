# visualizer/urls.py

from django.urls import path
from . import api_views
from django.contrib.auth import views as auth_views
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)
from .api_views import SignupAPIView
from .api_views import MyNetworksAPIView
from .views_jwt import MyTokenObtainPairView
from .api_views import SaveNetworkAPIView
from .api_views import RelatedGraphJSONAPIView
from .api_views import UpdateNetworkAPIView 
from .api_views import DeleteNetworkAPIView
from .api_views import DeezerProxyView, DeezerArtistTopView

urlpatterns = [
    path("api/signup/", SignupAPIView.as_view(), name="api_signup"), # サインアップページ
    path('api/my-networks/', MyNetworksAPIView.as_view(), name='my_networks_api'),# 保存済みネットワーク一覧
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path("api/save-network/", SaveNetworkAPIView.as_view(), name="save_network"),
    path("api/graph-json/", RelatedGraphJSONAPIView.as_view(), name="graph_json"),
    path("api/deezer/", DeezerProxyView.as_view()),
    path("api/deezer/top/", DeezerArtistTopView.as_view()),
    path("api/update-network/<int:pk>/", UpdateNetworkAPIView.as_view(), name="update_network"),
    path("api/delete-network/<int:pk>/", DeleteNetworkAPIView.as_view(), name="delete_network"),
    
]
