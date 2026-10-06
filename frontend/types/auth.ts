export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN';
};

export type LoginInput = {
  email: string;
  password: string;
};

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
  confirmPassword?: string;
};
