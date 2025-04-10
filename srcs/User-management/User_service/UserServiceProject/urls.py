"""UserServiceProject URL Configuration

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
from django.conf import settings
from django.conf.urls.static import static
from .views import CheckUserInfo, RegisterUserInfo, InitialDeleteUserInfo, GetUserIDbyEmail, GetUserInfo, UpdateUserInfo

urlpatterns = [
    path('check-user-info/', CheckUserInfo, name="CheckUserInfo"),
    path('register-user-info/', RegisterUserInfo, name="RegisterUserInfo"),
    path('inital-delete-user-info/', InitialDeleteUserInfo, name="InitialDeleteUserInfo"),
    path('get-id-by-email/', GetUserIDbyEmail, name="getuserIDbyEmail"),
    path('get-user-info/',  GetUserInfo, name="GetUserInfo"),
    path('update-user-info/', UpdateUserInfo, name="UpdateUserInfo")
]


# Django で `MEDIA_URL` を serve しない (Nginx に任せる)
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)