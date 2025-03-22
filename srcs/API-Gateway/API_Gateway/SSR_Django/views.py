from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny, IsAuthenticated
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, HttpResponse
from django.conf import settings
import requests
import os
from django.shortcuts import redirect
from dotenv import load_dotenv

DOMAIN = os.getenv('DOMAIN')

def django_render(url):
    ssr_response = requests.get(url)
    return HttpResponse(ssr_response.content, status=ssr_response.status_code)

def landing_page_view(request):
    return django_render("https://innerproxy/")

def signup_page_view(request):
    return django_render("https://innerproxy/signup")

def get_qr_page(request, userid, img_url):
    return django_render(f"https://innerproxy/get_qr/{userid}/{img_url}")

def otp_page(request, userid):
    return django_render(f"https://innerproxy/otp/{userid}/")

def home_page(request):
    return django_render("https://innerproxy/pages/home/")