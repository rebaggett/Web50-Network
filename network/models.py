from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    image = models.URLField(default="https://freesvg.org/img/dinopixel.png")
    following = models.ManyToManyField("self", blank=True, symmetrical = False, related_name="followers")

    def serialize(self):
        return {
            "id": self.pk,
            "username": self.username,
            "image": self.image,
            "followers": [user.username for user in self.followers.all()],
            "following": [user.username for user in self.following.all()],
        }

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="posts")
    likes = models.ManyToManyField(User, blank=True, null=True, related_name="liked_posts")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    edited = models.DateTimeField(auto_now=True)

    def serialize(self):
        return {
            "id": self.pk,
            "author": self.author.username,
            "authorimage": self.author.image,
            "likes": [user.pk for user in self.likes.all()],
            "content": self.content,
            "timestamp": self.timestamp.strftime("%b. %d, %Y, at %I:%M %p"),
            "edited": self.edited.strftime("%b. %d, %Y, at %I:%M %p")
        }
