import { useMutation, useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { OnboardingConfig } from '@/types';

interface ProfileData {
  about_me?: string;
  street_address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  birthdate?: string;
}

interface UpdateConfigData {
  page2Components: string[];
  page3Components: string[];
}

export const useOnboardingConfig = () => {
  return useQuery({
    queryKey: ['onboarding-config'],
    queryFn: async () => {
      const response = await api.get<OnboardingConfig[]>(
        '/admin/onboarding/config',
      );
      return response.data;
    },
  });
};

export const useUpdateConfig = () => {
  return useMutation({
    mutationFn: async (data: UpdateConfigData) => {
      // Convert the data to the format expected by the API
      const updates = [
        ...data.page2Components.map((component) => ({
          component,
          page_number: 2,
        })),
        ...data.page3Components.map((component) => ({
          component,
          page_number: 3,
        })),
      ];

      const response = await api.put('/admin/onboarding/config', { updates });
      return response.data;
    },
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async ({
      userId,
      data,
    }: {
      userId: string;
      data: ProfileData;
    }) => {
      const response = await api.put(`/profile/${userId}`, data);
      return response.data;
    },
  });
};
