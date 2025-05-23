"""TwoFAServiceProject URL Configuration

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
from .views import register, Get2FAStatus, AuthOtp, Toggle2FA

urlpatterns = [
    path("register-2fa-info/", register, name="register-2fa"),
    path("get-2fa-status/", Get2FAStatus, name="get2FAstatus"),
    path("auth-otp/", AuthOtp, name="auth-otp"),
    path("toggle-2fa/", Toggle2FA, name="toggle-2fa"),
]

