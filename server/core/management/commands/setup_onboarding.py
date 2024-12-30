from django.core.management.base import BaseCommand
from core.models import OnboardingConfig


class Command(BaseCommand):
    help = "Sets up initial onboarding configuration"

    def handle(self, *args, **kwargs):
        # Clear existing config
        OnboardingConfig.objects.all().delete()

        # Create default configuration
        configs = [
            OnboardingConfig(component="about", page_number=2),
            OnboardingConfig(component="address", page_number=2),
            OnboardingConfig(component="birthdate", page_number=3),
        ]

        OnboardingConfig.objects.bulk_create(configs)
        self.stdout.write(
            self.style.SUCCESS("Successfully created onboarding configuration")
        )
