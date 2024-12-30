from django.db import models
from django.contrib.auth.models import AbstractUser
from django.core.validators import MinLengthValidator
import uuid


class User(AbstractUser):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField(unique=True)
    first_name = models.CharField(max_length=30, blank=True, null=True)
    last_name = models.CharField(max_length=30, blank=True, null=True)
    phone_number = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    USERNAME_FIELD = "email"
    REQUIRED_FIELDS = ["username"]

    @property
    def full_name(self):
        return (
            f"{self.first_name} {self.last_name}"
            if self.first_name and self.last_name
            else self.email
        )

    def __str__(self):
        return self.email


class AbstractBaseModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class OnboardingConfig(AbstractBaseModel):
    COMPONENT_CHOICES = [
        ("about", "About Me"),
        ("address", "Address"),
        ("birthdate", "Birthdate"),
    ]
    PAGE_CHOICES = [
        (2, "Page 2"),
        (3, "Page 3"),
    ]

    component = models.CharField(max_length=20, choices=COMPONENT_CHOICES)
    page_number = models.IntegerField(choices=PAGE_CHOICES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ["component"]

    def __str__(self):
        return f"{self.get_component_display()} on Page {self.page_number}"


class UserProfile(AbstractBaseModel):
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name="profile")
    about_me = models.TextField(blank=True, null=True)
    street_address = models.CharField(max_length=255, blank=True, null=True)
    city = models.CharField(max_length=100, blank=True, null=True)
    state = models.CharField(
        max_length=2, blank=True, null=True, validators=[MinLengthValidator(2)]
    )
    zip_code = models.CharField(max_length=10, blank=True, null=True)
    birthdate = models.DateField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Profile for {self.user.email}"
