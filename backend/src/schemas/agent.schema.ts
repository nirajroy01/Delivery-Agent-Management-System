import { z } from 'zod';

export const agentCreateSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100, 'Full name is too long'),
  phoneNumber: z.string().trim().min(8, 'Phone number is required').max(25, 'Phone number is too long'),
  email: z.string().trim().email('Invalid email address'),
  serviceArea: z.string().trim().min(2, 'Service area must be at least 2 characters').max(100, 'Service area is too long'),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export const agentUpdateSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name must be at least 2 characters').max(100, 'Full name is too long').optional(),
  phoneNumber: z.string().trim().min(8, 'Phone number is required').max(25, 'Phone number is too long').optional(),
  email: z.string().trim().email('Invalid email address').optional(),
  serviceArea: z.string().trim().min(2, 'Service area must be at least 2 characters').max(100, 'Service area is too long').optional(),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
});

export const agentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
  serviceArea: z.union([z.string().trim(), z.array(z.string().trim())]).optional(),
  search: z.string().trim().optional(),
});
