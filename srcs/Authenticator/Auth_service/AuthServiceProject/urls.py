"""AuthServiceProject URL Configuration

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
from django.urls import path
from .views import password_check, register, AuthPassword, GetToken

urlpatterns = [
    path("password-check/", password_check, name="password-check"),
    path("register-auth-info/", register, name="register"),
    path("auth-password/", AuthPassword, name="auth-password"),
    path("get-token/", GetToken, name="get-token"),
]
