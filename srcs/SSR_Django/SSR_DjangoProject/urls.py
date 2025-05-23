"""SSR_DjangoProject URL Configuration

The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/3.2/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  path('', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  path('', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.urls import include, path
    2. Add a URL to urlpatterns:  path('blog/', include('blog.urls'))
"""
from django.contrib import admin
from django.urls import path
from .views import landing_page,signup_page,login_page, get_qr_page, otp_page, home_view, randommatch_page, matchgame_page, tournament_page, setting_page


urlpatterns = [
    path('', landing_page, name="landing_page"),
    path('signup/', signup_page, name="signup_page"),
    path('login/', login_page, name="login_page"),
    path('get_qr/<str:userid>/<str:img_url>', get_qr_page, name="qr_page"),
    path('otp/<str:userid>/', otp_page, name="otp_page"),

    path("home/", home_view, name="home_page"), 
    path('randommatch/', randommatch_page, name='randommatch_page'),
    path('match-game/<str:room_name>/', matchgame_page, name='matchgame_page'),
    path('tournament/', tournament_page, name='tournament_page'),
    path('setting/', setting_page, name='setting_page'),
]
