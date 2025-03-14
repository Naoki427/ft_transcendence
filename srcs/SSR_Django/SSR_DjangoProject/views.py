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
    decoded_img_url = base64.b64decode(img_url).decode('utf-8')  # URLデコード
    return render(request, "Unauthorized/qr.html", {"userid": userid, "img_url": decoded_img_url})