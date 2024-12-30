'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AboutMeStep } from '@/forms/onboarding/AboutMeStep';
import { AddressStep } from '@/forms/onboarding/AddressStep';
import { BirthdateStep } from '@/forms/onboarding/BirthdateStep';
import {
  useOnboardingConfig,
  useUpdateProfile,
} from '@/lib/queries/onboarding';
import { useUser } from '@/lib/queries/auth';
import { useRouter } from 'next/navigation';

const formSchema = z.object({
  about_me: z
    .string()
    .min(10, 'Please tell us a bit more about yourself (minimum 10 characters)')
    .optional()
    .or(z.literal('')),
  street_address: z
    .string()
    .min(5, 'Please enter a valid street address')
    .optional()
    .or(z.literal('')),
  city: z
    .string()
    .min(2, 'Please enter a valid city name')
    .optional()
    .or(z.literal('')),
  state: z
    .string()
    .length(2, 'State must be a 2-letter code (e.g., NY)')
    .optional()
    .or(z.literal('')),
  zip_code: z
    .string()
    .regex(
      /^\d{5}(-\d{4})?$/,
      'Please enter a valid ZIP code (e.g., 12345 or 12345-6789)',
    )
    .optional()
    .or(z.literal('')),
  birthdate: z
    .date()
    .min(new Date('1900-01-01'), 'Date must be after 1900')
    .max(new Date(), 'Date cannot be in the future')
    .optional(),
});

type FormData = z.infer<typeof formSchema>;
type FormField = keyof FormData;

export default function OnboardingForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const { toast } = useToast();
  const { data: user } = useUser();
  const { data: config, isLoading: configLoading } = useOnboardingConfig();
  const updateProfile = useUpdateProfile();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      about_me: '',
      street_address: '',
      city: '',
      state: '',
      zip_code: '',
    },
  });

  // Redirect if not logged in
  useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const totalSteps = 3;
  const progress = (step / totalSteps) * 100;

  const onSubmit = async (data: FormData) => {
    if (!user?.id) {
      toast({
        title: 'Error',
        description: 'User ID not found. Please try again.',
        variant: 'destructive',
      });
      return;
    }

    try {
      // Only submit to API on final step
      if (step === totalSteps) {
        await updateProfile.mutateAsync({
          userId: user.id,
          data: {
            ...data,
            birthdate: data.birthdate
              ? data.birthdate.toISOString().split('T')[0]
              : undefined,
          },
        });

        toast({
          title: 'Success',
          description: 'Profile completed successfully',
        });

        // Redirect to home page
        router.push('/');
      } else {
        // Just move to next step if not final
        setStep(step + 1);
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    }
  };

  const handleNext = async () => {
    // Validate current step fields before proceeding
    const currentFields = getCurrentStepFields();
    const isValid = await form.trigger(currentFields);

    if (isValid) {
      if (step === totalSteps) {
        await form.handleSubmit(onSubmit)();
      } else {
        setStep(step + 1);
      }
    }
  };

  const getCurrentStepFields = (): FormField[] => {
    const fields: Record<string, FormField[]> = {
      about: ['about_me'],
      address: ['street_address', 'city', 'state', 'zip_code'],
      birthdate: ['birthdate'],
    };

    switch (step) {
      case 2:
        return page2Components.flatMap((component) => fields[component] || []);
      case 3:
        return page3Components.flatMap((component) => fields[component] || []);
      default:
        return [];
    }
  };

  if (configLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="py-6">Loading configuration...</CardContent>
      </Card>
    );
  }

  // Default configuration if none exists
  const defaultConfig = {
    page2Components: ['about', 'address'],
    page3Components: ['birthdate'],
  };

  const page2Components =
    config?.filter((c) => c.page_number === 2).map((c) => c.component) ??
    defaultConfig.page2Components;
  const page3Components =
    config?.filter((c) => c.page_number === 3).map((c) => c.component) ??
    defaultConfig.page3Components;

  const renderStep = () => {
    switch (step) {
      case 1:
        return (
          <div className="space-y-4">
            <h2 className="text-2xl font-bold">Welcome to Zealthy!</h2>
            <p className="text-muted-foreground">
              Let's get your profile set up. We'll collect some basic
              information about you over the next few steps.
            </p>
          </div>
        );
      case 2:
        return (
          <>
            {page2Components.includes('about') && <AboutMeStep form={form} />}
            {page2Components.includes('address') && <AddressStep form={form} />}
            {page2Components.includes('birthdate') && (
              <BirthdateStep form={form} />
            )}
          </>
        );
      case 3:
        return (
          <>
            {page3Components.includes('about') && <AboutMeStep form={form} />}
            {page3Components.includes('address') && <AddressStep form={form} />}
            {page3Components.includes('birthdate') && (
              <BirthdateStep form={form} />
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>
          Step {step} of {totalSteps}
        </CardTitle>
        <Progress value={progress} className="w-full" />
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            {renderStep()}
            <div className="flex justify-between">
              {step > 1 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                >
                  Previous
                </Button>
              )}
              <Button
                type="button"
                onClick={handleNext}
                disabled={updateProfile.isPending}
                className={step === 1 ? 'w-full' : ''}
              >
                {updateProfile.isPending
                  ? 'Saving...'
                  : step === totalSteps
                  ? 'Complete'
                  : 'Next'}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
