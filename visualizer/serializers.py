from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth.models import User
from .models import SavedNetwork

class MyTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)

        token['username'] = user.username

        return token
# サインアップ
class UserSignupSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ["username", "password"]
        extra_kwargs = {
            "password": {"write_only": True}
        }

    def validate_username(self, value):
        if User.objects.filter(username=value).exists():
            raise serializers.ValidationError("このユーザー名は既に使用されています。")
        return value

    def create(self, validated_data):
        return User.objects.create_user(**validated_data)
# マイライブラリ保存
class SavedNetworkSerializer(serializers.ModelSerializer):
    class Meta:
        model = SavedNetwork
        fields = ['id', 'center_artist', 'graph_json', 'memo', 'image_base64', 'path', 'created_at']