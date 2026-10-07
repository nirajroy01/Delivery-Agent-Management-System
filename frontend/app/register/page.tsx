'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getApiErrorMessage, register } from '@/lib/api';

const schema = z.object({
  name: z.string().min(1, 'Name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Confirm your password'),
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: 'Passwords do not match',
});

export default function RegisterPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      router.push('/login');
    } catch (error: unknown) {
      form.setError('root', { message: getApiErrorMessage(error, 'Registration failed') });
    }
  };

  return (
    <div className="surface mx-auto max-w-md p-6 sm:p-8">
      <h1 className="mb-2 text-2xl font-semibold text-[var(--text)]">Register</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Create an account for the delivery agent system.</p>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text)]">Name</label>
          <input autoComplete="name" {...form.register('name')} className="field-control" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text)]">Email</label>
          <input type="email" autoComplete="email" {...form.register('email')} className="field-control" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text)]">Password</label>
          <input type="password" autoComplete="new-password" {...form.register('password')} className="field-control" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text)]">Confirm Password</label>
          <input type="password" autoComplete="new-password" {...form.register('confirmPassword')} className="field-control" />
        </div>
        {form.formState.errors.root && <p className="error-message">{String(form.formState.errors.root.message)}</p>}
        <button type="submit" className="primary-button w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-blue-400">
          Login here
        </Link>
      </p>
    </div>
  );
}
