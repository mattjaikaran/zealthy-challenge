from ninja import Schema
from datetime import date
from uuid import UUID
from typing import Optional


class UserSchema(Schema):
    id: str
    email: str
    username: str


class UserLoginSchema(Schema):
    email: str
    password: str


class UserDataSchema(Schema):
    id: str
    email: str
    username: str
    about_me: Optional[str] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    birthdate: Optional[str] = None
    created_at: str


class AuthResponseSchema(Schema):
    user: UserSchema
    token: str


class UserRegistrationSchema(Schema):
    email: str
    username: str
    password: str


class UserProfileSchema(Schema):
    about_me: Optional[str] = None
    street_address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    zip_code: Optional[str] = None
    birthdate: Optional[date] = None


class UserProfileResponseSchema(Schema):
    user: UserSchema
    profile: UserProfileSchema


class OnboardingConfigSchema(Schema):
    component: str
    page_number: int


class OnboardingConfigUpdateSchema(Schema):
    page_number: int
