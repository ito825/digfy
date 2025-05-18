from django.db import models
from django.contrib.auth.models import User

class SavedNetwork(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    center_artist = models.CharField(max_length=255)
    graph_json = models.JSONField()
    memo = models.TextField(blank=True, null=True)
    image_base64 = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.center_artist} by {self.user.username}"
