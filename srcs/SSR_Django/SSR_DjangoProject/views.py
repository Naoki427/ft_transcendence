from django.shortcuts import render, redirect
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
import base64
import requests
from django.http import JsonResponse, HttpResponse
from django.views.decorators.csrf import csrf_exempt
import json


def landing_page(request):
    return render(request, "Unauthorized/index.html") 

def signup_page(request):
    return render(request, "Unauthorized/signup.html")

def get_qr_page(request, userid, img_url):
    decoded_img_url = base64.b64decode(img_url).decode('utf-8')
    return render(request, "Unauthorized/qr.html", {"userid": userid, "img_url": decoded_img_url})

def otp_page(request, userid):
    return render(request, "Unauthorized/otp.html",  {"userid": userid})

def home_view(request):
    return render(request, "Authorized/home.html")

def matchmaking_page(request):
    return render(request, "Authorized/matchmaking.html")

def matchgame_page(request, room_name):
    return render(request, "Authorized/match-game.html", {'room_name': room_name})

def tournament_page(request):
    return render(request, "Authorized/tournament.html")