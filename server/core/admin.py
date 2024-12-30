from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from unfold.admin import ModelAdmin
from .models import User, OnboardingConfig, UserProfile


@admin.register(User)
class CustomUserAdmin(UserAdmin, ModelAdmin):
    list_display = ("email", "username", "is_staff", "is_active")
    search_fields = ("email", "username")
    ordering = ("email",)


@admin.register(OnboardingConfig)
class OnboardingConfigAdmin(ModelAdmin):
    list_display = ("component", "page_number", "created_at", "updated_at")
    list_filter = ("page_number",)
    search_fields = ("component",)


@admin.register(UserProfile)
class UserProfileAdmin(ModelAdmin):
    list_display = ("user", "birthdate", "city", "state", "created_at")
    list_filter = ("state",)
    search_fields = ("user__email", "city", "state")
