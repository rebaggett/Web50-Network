from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    image = models.URLField(default="https://freesvg.org/img/dinopixel.png")
    following = models.ManyToManyField("self", blank=True, related_name="followers")

    def serialize(self):
        return {
            "id": self.id,
            "username": self.username,
            "image": self.image,
            # "followers-id": [follower.pk for follower in self.followers.order_by("username").all()],
            # "followers-username": [follower.username for follower in self.followers.order_by("username").all()],
            # "followers-img": [follower.image for follower in self.followers.order_by("username").all()],
            # "following-id": [following.pk for following in self.following.order_by("username").all()],
            # "following-username": [following.username for following in self.following.order_by("username").all()],
            # "following-img": [following.image for following in self.following.order_by("username").all()],
            # "liked_posts": [post.pk for post in self.liked_posts.all()]
        }

class Post(models.Model):
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="posts")
    likes = models.ManyToManyField(User, blank=True, null=True, related_name="liked_posts")
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)
    edited = models.DateTimeField(null=True)
