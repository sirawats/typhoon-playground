export interface CreateAccountRequestDTO {
  email: string;
  fullName: string;
  password: string;
}

export interface CreateAccountResponseDTO {
  email: string;
  fullName: string;
}

export interface LoginRequestDTO {
  email: string;
  password: string;
}

export interface User {
  id: number;
  email: string;
  fullName: string;
}

export interface LoginResponseDTO {
  accessToken: string;
  tokenType: string;
  user: User;
}
