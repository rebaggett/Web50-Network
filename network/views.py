import json
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http import HttpResponse, HttpResponseRedirect
from django.shortcuts import render
from django.urls import reverse
from django.core.paginator import Paginator
from django.http import JsonResponse

from .models import User, Post


def index(request):
    #Paginates all posts in increments of 10
    post_list = Post.objects.all().order_by('-timestamp')
    paginator = Paginator(post_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "network/index.html", {
        'page_obj': page_obj
    })

def profile_view(request, id):
    # Get user that id corresponds to
    profile_user = User.objects.get(pk = id)
    followers = profile_user.followers.all().count()
    following = profile_user.following.all().count()

    #Get current user
    if request.user.is_authenticated:
        current_user = User.objects.get(pk = request.user.pk)
    else:
        current_user = None
    
    # Gets posts related to profile and paginates them
    post_list = Post.objects.filter(author=profile_user.pk).order_by("-timestamp")
    paginator = Paginator(post_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "network/profile.html", {
        "page_obj": page_obj,
        "profile_user": profile_user,
        "current_user": current_user,
        "followers": followers,
        "following": following
    })

@login_required()
def following_view(request):
    current_user = User.objects.get(pk=request.user.pk)

    post_list = Post.objects.filter(author__in = current_user.following.all())
    post_list =post_list.order_by('-timestamp')
    paginator = Paginator(post_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "network/following.html", {
        "page_obj": page_obj
    })

@login_required()
def create_post(request):
    
    #Composing a post must be via POST
    if request.method != "POST":
        return JsonResponse({"error": "POST request required."}, status=400)
    
    data = json.loads(request.body)
    author = data.get("author", "")
    content = data.get("content","")

    author = User.objects.get(pk=author)
    
    post = Post(
        author=author,
        content=content
    )
    post.save()

    return JsonResponse(post.serialize(), status = 201)

@login_required()
def edit_post(request, id):
    
    if request.method == "PUT":
        data = json.loads(request.body)
        content = data.get("content","")
        userId = data.get("user","")

        userId = int(userId)

        post = Post.objects.get(pk = id)
        user = User.objects.get(pk = userId)

        if user != post.author:
            return JsonResponse({"error": "Users may only edit their own posts."})

        post.content = content
        post.save(update_fields=["content", "edited"])

        return JsonResponse(post.serialize(), status=201, safe=False)

def like_post(request, id):
    
    if request.method =="PUT":
        post = Post.objects.get(pk = id)
        if request.user in post.likes.all():
            post.likes.remove(request.user)
        else:
            post.likes.add(request.user)

        return JsonResponse(post.serialize(), safe=False, status=201)

def followers(request, id):

    followers = User.objects.filter(following = id)
    followers = followers.order_by("username").all()
    return JsonResponse([follower.serialize() for follower in followers], safe=False)

def following(request, id):

    following = User.objects.filter(followers = id)
    following = following.order_by("username").all()
    return JsonResponse([person.serialize() for person in following], safe=False)

def likes(request, id):

    likers = User.objects.filter(liked_posts = id)
    likers = likers.order_by("username").all()
    return JsonResponse([liker.serialize() for liker in likers], safe=False)

def update_profile(request, id):

    if request.method == "PUT":
        data = json.loads(request.body)
        image = data.get("img", "")

        profile = User.objects.get(pk = id)
        profile.image = image
        profile.save(update_fields=["image"])
        
        return JsonResponse({
            "message": "Profile updated successfully.",
            "img": profile.image,
        }, status=201)

def login_view(request):
    if request.method == "POST":

        # Attempt to sign user in
        username = request.POST["username"]
        password = request.POST["password"]
        user = authenticate(request, username=username, password=password)

        # Check if authentication successful
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            return render(request, "network/login.html", {
                "message": "Invalid username and/or password."
            })
    else:
        return render(request, "network/login.html")

def logout_view(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def register(request):
    if request.method == "POST":
        username = request.POST["username"]
        email = request.POST["email"]

        # Ensure password matches confirmation
        password = request.POST["password"]
        confirmation = request.POST["confirmation"]
        if password != confirmation:
            return render(request, "network/register.html", {
                "message": "Passwords must match."
            })

        # Attempt to create new user
        try:
            user = User.objects.create_user(username, email, password)
            user.save()
        except IntegrityError:
            return render(request, "network/register.html", {
                "message": "Username already taken."
            })
        login(request, user)
        return HttpResponseRedirect(reverse("index"))
    else:
        return render(request, "network/register.html")
