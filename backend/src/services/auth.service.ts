import { User } from '../models/user.model';
import { LoginInput, RegisterInput } from '../types/auth.types';
import { comparePassword, hashPassword } from '../utils/password';
import { signToken } from '../utils/jwt';

export const registerUser = async (input: RegisterInput) => {
  const email = input.email.toLowerCase();
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    const error: any = new Error('Email already exists');
    error.statusCode = 409;
    throw error;
  }

  const totalUsers = await User.countDocuments();
  const passwordHash = await hashPassword(input.password);
  const user = await User.create({
    name: input.name,
    email,
    passwordHash,
    role: totalUsers === 0 ? 'ADMIN' : 'USER',
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};

export const loginUser = async (input: LoginInput) => {
  const email = input.email.toLowerCase();
  const user = await User.findOne({ email });

  if (!user) {
    const error: any = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await comparePassword(input.password, user.passwordHash);
  if (!isMatch) {
    const error: any = new Error('Invalid email or password');
    error.statusCode = 401;
    throw error;
  }

  const token = signToken({ userId: user._id.toString(), role: user.role });

  return {
    token,
    user: {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await User.findById(userId).select('-passwordHash');
  if (!user) {
    const error: any = new Error('User not found');
    error.statusCode = 404;
    throw error;
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
  };
};
