from django.shortcuts import render, redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
import base64
import requests
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json
from django.views.decorators.csrf import ensure_csrf_cookie


def landing_page(request):
    return render(request, "Unauthorized/index.html") 

def signup_page(request):
    return render(request, "Unauthorized/signup.html")

def login_page(request):
    return render(request, "Unauthorized/login.html")

def get_qr_page(request, userid, img_url):
    decoded_img_url = base64.b64decode(img_url).decode('utf-8')
    return render(request, "Unauthorized/qr.html", {"userid": userid, "img_url": decoded_img_url})

@ensure_csrf_cookie
def otp_page(request, userid):
    return render(request, "Unauthorized/otp.html",  {"userid": userid})

def home_view(request):
    return render(request, "Authorized/home.html")

def randommatch_page(request):
    return render(request, "Authorized/randommatch.html")

def matchgame_page(request, room_name):
    return render(request, "Authorized/match-game.html", {'room_name': room_name})

def tournament_page(request):
    return render(request, "Authorized/tournament.html")

def setting_page(request):
    return render(request, "Authorized/setting.html")