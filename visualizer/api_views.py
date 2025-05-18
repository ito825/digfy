from django.contrib.auth.models import User
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from rest_framework.permissions import IsAuthenticated
from .deezer_logic import DeezerInfo
from .models import SavedNetwork
from django.http import JsonResponse
import requests
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator

class RelatedArtistsAPIView(APIView):
    def post(self, request):
        artist_name = request.data.get('artist')
        level = int(request.data.get('level', 2))

        if not artist_name:
            return Response({'error': 'Artist name is required.'}, status=400)

        deezer = DeezerInfo()
        graph_data = deezer.get_graph_data(artist_name, level=level)
        if not graph_data:
            return Response({'error': 'Artist not found.'}, status=404)

        return Response(graph_data)

class SignupAPIView(APIView):
    def post(self, request):
        username = request.data.get("username")
        password = request.data.get("password")

        if not username or not password:
            return Response({"error": "Missing credentials"}, status=status.HTTP_400_BAD_REQUEST)

        if User.objects.filter(username=username).exists():
            return Response({"error": "Username already exists"}, status=status.HTTP_400_BAD_REQUEST)

        user = User.objects.create_user(username=username, password=password)
        return Response({"message": "User created"}, status=status.HTTP_201_CREATED)

class MyNetworksAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        items = SavedNetwork.objects.filter(user=request.user).order_by('-created_at')
        data = [
            {
                "id": item.id, 
                "center_artist": item.center_artist,
                "graph_json": item.graph_json,
                "memo": item.memo,
                "image_base64": item.image_base64,
                "created_at": item.created_at,
            }
            for item in items
        ]
        return Response(data)

class SaveNetworkAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        center_artist = request.data.get("center_artist")
        graph_json = request.data.get("graph_json")
        memo = request.data.get("memo", "")
        image_base64 = request.data.get("image_base64", "")

        if not center_artist or not graph_json:
            return Response({"error": "Missing data"}, status=400)

        SavedNetwork.objects.create(
            user=request.user,
            center_artist=center_artist,
            graph_json=graph_json,
            memo=memo,
            image_base64=image_base64
        )
        return Response({"message": "保存しました"}, status=201)
class RelatedGraphJSONAPIView(APIView):
    def post(self, request):
        artist_name = request.data.get("artist")
        level = int(request.data.get("level", 2))

        if not artist_name:
            return Response({"error": "Artist name is required"}, status=status.HTTP_400_BAD_REQUEST)

        deezer = DeezerInfo()
        graph_data = deezer.get_graph_json(artist_name, level=level)

        if not graph_data:
            return Response({"error": "Artist not found"}, status=status.HTTP_404_NOT_FOUND)

        return Response(graph_data)  
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
class DeleteNetworkAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            item = SavedNetwork.objects.get(pk=pk, user=request.user)
            item.delete()
            return Response({"message": "削除しました"}, status=200)
        except SavedNetwork.DoesNotExist:
            return Response({"error": "データが見つかりません"}, status=404)

@csrf_exempt
def deezer_proxy(request):
    artist_name = request.GET.get("q")
    if not artist_name:
        return JsonResponse({"error": "Missing 'q' parameter"}, status=400)

    try:
        deezer_url = f"https://api.deezer.com/search/artist?q={artist_name}"
        res = requests.get(deezer_url)
        return JsonResponse(res.json(), safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def deezer_artist_top(request):
    artist_id = request.GET.get("id")
    if not artist_id:
        return JsonResponse({"error": "Missing 'id' parameter"}, status=400)

    try:
        deezer_url = f"https://api.deezer.com/artist/{artist_id}/top?limit=1"
        res = requests.get(deezer_url)
        return JsonResponse(res.json(), safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)
class DeleteNetworkAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        try:
            item = SavedNetwork.objects.get(pk=pk, user=request.user)
            item.delete()
            return Response({"message": "削除しました"}, status=204)
        except SavedNetwork.DoesNotExist:
            return Response({"error": "データが見つかりません"}, status=404)
