from django.contrib import admin 
from django.urls import path,include

urlpatterns = [
   path('admin/', admin.site.urls),                          # 管理画面
   path('accounts/', include('django.contrib.auth.urls')),   # ログイン・ログアウト
   path('', include('visualizer.urls')),                     # visualizerアプリのURLに全て任せる

]
