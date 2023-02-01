from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    image = models.URLField(default="https://freesvg.org/img/dinopixel.png")
    following = models.ManyToManyField("self", blank=True, related_name="followers")

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="posts")
    likes = models.ManyToManyField(User, blank=True, null=True, related_name="liked_posts")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    edited = models.DateTimeField(null=True)
