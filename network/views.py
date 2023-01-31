import json
import datetime
from urllib import parse
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
    # Get user that username corresponds to
    # username = parse.unquote(username)
    profile_user = User.objects.get(pk = id)
    

    # Gets posts related to profile and paginates them
    post_list = Post.objects.filter(author=profile_user.pk).order_by("-timestamp")
    paginator = Paginator(post_list, 10)
    page_number = request.GET.get('page')
    page_obj = paginator.get_page(page_number)

    return render(request, "network/profile.html", {
        "page_obj": page_obj,
        "profile_user": profile_user
    })

@login_required()
def following_view(request):
    current_user = User.objects.get(pk=request.user.pk)

    post_list = Post.objects.filter(author__in = current_user.following)
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

    author = User.objects.get(username=author)
    
    post = Post(
        author=author,
        content=content
    )
    post.save()

    timestamp = post.timestamp.strftime('%b. %d, %Y, %I:%M %p')

    return JsonResponse({
        "message": "Post created successfully.",
        "id": post.pk,
        "author": post.author.username,
        "content": post.content,
        "timestamp": timestamp,
    }, status = 201)

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