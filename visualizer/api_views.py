from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .models import SavedNetwork
from django.http import JsonResponse
import requests
from django.views.decorators.csrf import csrf_exempt
from .async_deezer import DeezerGraphBuilder
import asyncio
from rest_framework.permissions import AllowAny
from .serializers import UserSignupSerializer
from .serializers import SavedNetworkSerializer



# -------------------- Related Artist API（キャッシュ付き） --------------------

class RelatedGraphJSONAPIView(APIView):
    def post(self, request):
        artist_name = request.data.get("artist")

        if not artist_name:
            return Response({"error": "Artist name is required"}, status=status.HTTP_400_BAD_REQUEST)

        builder = DeezerGraphBuilder()

        try:
            graph_data = asyncio.run(builder.build_graph(artist_name))
        except Exception as e:
            print("Async error:", e)
            return Response({"error": "Failed to build graph", "detail": str(e)}, status=500)

        return Response(graph_data)

# -------------------- サインアップ --------------------

class SignupAPIView(APIView):
    permission_classes = [AllowAny]  # ← 明示しておくと安全

    def post(self, request):
        serializer = UserSignupSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()
            return Response({"message": "ユーザー登録が完了しました"}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

# -------------------- マイライブラリ取得 --------------------

class MyNetworksAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = SavedNetwork.objects.filter(user=request.user).order_by('-created_at')
        serializer = SavedNetworkSerializer(items, many=True)
        return Response(serializer.data)

# -------------------- 保存 --------------------

class SaveNetworkAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        center_artist = request.data.get("center_artist")
        graph_json = request.data.get("graph_json")
        memo = request.data.get("memo", "")
        image_base64 = request.data.get("image_base64", "")
        path = request.data.get("path", [])

        if not center_artist or not graph_json:
            return Response({"error": "Missing data"}, status=400)

        saved = SavedNetwork.objects.create(
            user=request.user,
            center_artist=center_artist,
            graph_json=graph_json,
            memo=memo,
            image_base64=image_base64,  
            path=path
        )

        serializer = SavedNetworkSerializer(saved)
        return Response(serializer.data, status=201)


# -------------------- メモ更新 --------------------

class UpdateNetworkAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def patch(self, request, pk):
        try:
            item = SavedNetwork.objects.get(pk=pk, user=request.user)
            item.memo = request.data.get("memo", item.memo)
            item.save()
            return Response({"message": "更新しました"}, status=200)
        except SavedNetwork.DoesNotExist:
            return Response({"error": "データが見つかりません"}, status=404)

# -------------------- 削除（DELETE） --------------------

class DeleteNetworkAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            item = SavedNetwork.objects.get(pk=pk, user=request.user)
            item.delete()
            return Response({"message": "削除しました"}, status=204)
        except SavedNetwork.DoesNotExist:
            return Response({"error": "データが見つかりません"}, status=404)

# -------------------- Deezer API プロキシ --------------------

class DeezerProxyView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        artist_name = request.GET.get("q")

        if not artist_name:
            return Response({"error": "Missing 'q' parameter"}, status=400)

        try:
            deezer_url = f"https://api.deezer.com/search/artist?q={artist_name}"
            res = requests.get(deezer_url)
            return Response(res.json())
        except Exception as e:
            return Response({"error": str(e)}, status=500)



class DeezerArtistTopView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        artist_id = request.GET.get("id")
        if not artist_id:
            return Response({"error": "Missing 'id' parameter"}, status=400)

        try:
            deezer_url = f"https://api.deezer.com/artist/{artist_id}/top?limit=1"
            res = requests.get(deezer_url)
            return Response(res.json())
        except Exception as e:
            return Response({"error": str(e)}, status=500)
