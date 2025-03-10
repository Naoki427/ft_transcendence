from django.contrib.auth.models import AbstractUser, Group, Permission
from django.db import models

class CustomUser(AbstractUser):
    username = models.CharField(unique=True, max_length=10)
    email = models.EmailField(unique=True)
    language = models.IntegerField(default=0)
    color = models.IntegerField(default=0)
    profile_image_url = models.URLField(default="https://User-Nginx/media/profile_images/default.png", blank=True)

    groups = models.ManyToManyField(Group, related_name="customuser_groups", blank=True)
    user_permissions = models.ManyToManyField(Permission, related_name="customuser_permissions", blank=True)

    def __str__(self):
        return self.username
