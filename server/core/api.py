from typing import List
from ninja_extra import NinjaExtraAPI, api_controller, http_get, http_post, http_put
from ninja_extra.exceptions import APIException
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model, authenticate
from django.http import Http404
from django.conf import settings
import jwt
from datetime import datetime, timedelta
from .models import OnboardingConfig, UserProfile
from .schemas import (
    UserRegistrationSchema,
    UserProfileSchema,
    OnboardingConfigSchema,
    OnboardingConfigUpdateSchema,
    AuthResponseSchema,
    UserProfileResponseSchema,
    UserDataSchema,
    UserLoginSchema,
)

User = get_user_model()


def create_access_token(user_id: str) -> str:
    """Create a JWT token for the user."""
    payload = {
        "user_id": str(user_id),
        "exp": datetime.utcnow() + timedelta(days=1),  # Token expires in 1 day
        "iat": datetime.utcnow(),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm="HS256")


def get_user_from_token(token: str):
    """Get user from JWT token."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        user = User.objects.get(id=payload["user_id"])
        return user
    except (jwt.InvalidTokenError, User.DoesNotExist):
        return None


@api_controller("/auth", tags=["Authentication"])
class AuthController:
    @http_post("/register", response={201: AuthResponseSchema, 400: dict})
    def register_user(self, data: UserRegistrationSchema):
        try:
            if User.objects.filter(email=data.email).exists():
                return 400, {"message": "Email already registered"}

            user = User.objects.create_user(
                username=data.username, email=data.email, password=data.password
            )
            UserProfile.objects.create(user=user)
            token = create_access_token(user.id)

            return 201, {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "username": user.username,
                },
                "token": token,
            }
        except Exception as e:
            return 400, {"message": str(e)}

    @http_post("/login", response={200: AuthResponseSchema, 401: dict})
    def login_user(self, data: UserLoginSchema):
        try:
            # Try to authenticate with email
            user = authenticate(username=data.email, password=data.password)

            if not user:
                # If email auth fails, try username
                user = authenticate(username=data.email, password=data.password)

            if not user:
                return 401, {"message": "Invalid credentials"}

            token = create_access_token(user.id)

            return 200, {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "username": user.username,
                },
                "token": token,
            }
        except Exception as e:
            return 401, {"message": str(e)}

    @http_get("/me", response={200: UserProfileResponseSchema, 401: dict})
    def get_current_user(self, request):
        try:
            auth_header = request.headers.get("Authorization")
            if not auth_header or not auth_header.startswith("Bearer "):
                return 401, {"message": "No valid token provided"}

            token = auth_header.split(" ")[1]
            user = get_user_from_token(token)

            if not user:
                return 401, {"message": "Invalid token"}

            profile = UserProfile.objects.get_or_create(user=user)[0]

            return 200, {
                "user": {
                    "id": str(user.id),
                    "email": user.email,
                    "username": user.username,
                },
                "profile": {
                    "about_me": profile.about_me,
                    "street_address": profile.street_address,
                    "city": profile.city,
                    "state": profile.state,
                    "zip_code": profile.zip_code,
                    "birthdate": (
                        profile.birthdate.isoformat() if profile.birthdate else None
                    ),
                },
            }
        except Exception as e:
            return 401, {"message": str(e)}


@api_controller("/profile", tags=["User Profile"])
class ProfileController:
    @http_put("/{user_id}", response={200: dict, 400: dict, 404: dict})
    def update_profile(self, user_id: str, data: UserProfileSchema):
        try:
            user = get_object_or_404(User, id=user_id)
            profile = user.profile

            for field, value in data.dict(exclude_unset=True).items():
                setattr(profile, field, value)

            profile.save()
            return 200, {"message": "Profile updated successfully"}
        except Http404:
            return 404, {"message": "User not found"}
        except Exception as e:
            return 400, {"message": str(e)}


@api_controller("/admin/onboarding", tags=["Admin"])
class OnboardingConfigController:
    @http_get("/config", response=List[OnboardingConfigSchema])
    def get_config(self):
        try:
            configs = OnboardingConfig.objects.all()
            return [OnboardingConfigSchema.from_orm(config) for config in configs]
        except Exception as e:
            raise APIException(str(e))

    @http_put("/config/{component}", response={200: dict, 400: dict})
    def update_config(self, component: str, data: OnboardingConfigUpdateSchema):
        try:
            config = get_object_or_404(OnboardingConfig, component=component)
            config.page_number = data.page_number
            config.save()
            return 200, {"message": "Configuration updated successfully"}
        except Http404:
            return 404, {"message": "Component not found"}
        except Exception as e:
            return 400, {"message": str(e)}


@api_controller("/data", tags=["Data"])
class DataController:
    @http_get("/users", response=List[dict])
    def get_user_data(self):
        try:
            users = User.objects.select_related("profile").all()
            return [
                {
                    "id": str(user.id),
                    "email": user.email,
                    "about_me": user.profile.about_me,
                    "street_address": user.profile.street_address,
                    "city": user.profile.city,
                    "state": user.profile.state,
                    "zip_code": user.profile.zip_code,
                    "birthdate": user.profile.birthdate,
                    "created_at": user.created_at,
                }
                for user in users
            ]
        except Exception as e:
            raise APIException(str(e))


@api_controller("/users", tags=["Users"], auth=None)
class UserController:
    @http_get("/", response=List[UserDataSchema])
    def list_users(self):
        try:
            users = User.objects.select_related("profile").all()
            user_data = []

            for user in users:
                # Create profile if it doesn't exist
                profile, created = UserProfile.objects.get_or_create(user=user)

                user_data.append(
                    {
                        "id": str(user.id),
                        "email": user.email,
                        "username": user.username,
                        "about_me": profile.about_me,
                        "street_address": profile.street_address,
                        "city": profile.city,
                        "state": profile.state,
                        "zip_code": profile.zip_code,
                        "birthdate": (
                            profile.birthdate.isoformat() if profile.birthdate else None
                        ),
                        "created_at": user.created_at.isoformat(),
                    }
                )

            return user_data
        except Exception as e:
            raise APIException(str(e))
