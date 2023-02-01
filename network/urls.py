from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path("<int:id>", views.profile_view, name="profile"),
    path("following", views.following_view, name="following"),
    path("login", views.login_view, name="login"),
    path("logout", views.logout_view, name="logout"),
    path("register", views.register, name="register"),

    #API Routes
    path("post", views.create_post, name="create"),
    path("<int:id>/following", views.following, name="profile-following"),
    path("<int:id>/followers", views.followers, name="profile-followers"),
]
