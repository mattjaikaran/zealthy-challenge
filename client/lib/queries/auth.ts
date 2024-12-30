import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';

interface User {
  id: string;
  email: string;
  username: string;
}

interface AuthResponse {
  user: User;
  token: string;
}

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterCredentials {
  email: string;
  username: string;
  password: string;
}

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: LoginCredentials) => {
      const { data } = await api.post<AuthResponse>('/auth/login', credentials);
      localStorage.setItem('token', data.token);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });
}

export function useRegister() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      const { data } = await api.post<AuthResponse>(
        '/auth/register',
        credentials,
      );
      localStorage.setItem('token', data.token);
      return data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(['user'], data.user);
    },
  });
}

export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      localStorage.removeItem('token');
      return null;
    },
    onSuccess: () => {
      queryClient.setQueryData(['user'], null);
    },
  });
}

export function useUser() {
  return useQuery({
    queryKey: ['user'],
    queryFn: async () => {
      try {
        const { data } = await api.get<{ user: User }>('/auth/me');
        return data.user;
      } catch (error) {
        return null;
      }
    },
    initialData: null,
    staleTime: Infinity,
  });
}
