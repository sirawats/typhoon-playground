import { useMutation } from '@tanstack/react-query';
import { authService } from '@/services/auth';
import type {
  CreateAccountRequestDTO,
  CreateAccountResponseDTO,
  LoginRequestDTO,
  LoginResponseDTO,
} from '@/types/dtos/auth';
import { useAuthStore } from '../store/auth';

export function useCreateAccount() {
  return useMutation<CreateAccountResponseDTO, Error, CreateAccountRequestDTO>({
    mutationFn: (data) => authService.createAccount(data),
  });
}

export function useLogin() {
  const setAuth = useAuthStore((state) => state.setAuth);

  return useMutation<LoginResponseDTO, Error, LoginRequestDTO>({
    mutationFn: (data) => authService.login(data),
    onSuccess: (data) => {
      setAuth(data.accessToken, data.user);
    },
  });
}
