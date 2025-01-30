import type {
  CreateAccountRequestDTO,
  CreateAccountResponseDTO,
  LoginRequestDTO,
  LoginResponseDTO,
} from '@/types/dtos/auth';
import { apiClient } from '../utils/api-client';
import CryptoJS from 'crypto-js';

// Client-side hash to avoid sending raw password
function hashPassword(password: string): string {
  return CryptoJS.SHA256(password).toString();
}

export const authService = {
  createAccount: async (
    data: CreateAccountRequestDTO
  ): Promise<CreateAccountResponseDTO> => {
    const hashedPassword = hashPassword(data.password);

    return apiClient.post<CreateAccountResponseDTO>('/auth/create-account', {
      email: data.email,
      fullName: data.fullName,
      password: hashedPassword,
    });
  },

  login: async (data: LoginRequestDTO): Promise<LoginResponseDTO> => {
    const hashedPassword = hashPassword(data.password);

    return apiClient.post<LoginResponseDTO>('/auth/login', {
      email: data.email,
      password: hashedPassword,
    });
  },
};
