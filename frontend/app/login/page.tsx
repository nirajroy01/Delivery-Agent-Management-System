'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { getApiErrorMessage, login } from '@/lib/api';
import { saveAuthSession } from '@/lib/auth';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const router = useRouter();
  const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: z.infer<typeof schema>) => {
    try {
      const response = await login(values);
      saveAuthSession(response.data.token, response.data.user);
      router.push('/dashboard');
    } catch (error: unknown) {
      form.setError('root', { message: getApiErrorMessage(error, 'Login failed') });
    }
  };

  return (
    <div className="surface mx-auto max-w-md p-6 sm:p-8">
      <h1 className="mb-2 text-2xl font-semibold text-[var(--text)]">Login</h1>
      <p className="mb-6 text-sm text-[var(--muted)]">Sign in to manage delivery agents.</p>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text)]">Email</label>
          <input type="email" autoComplete="email" {...form.register('email')} className="field-control" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-[var(--text)]">Password</label>
          <input type="password" autoComplete="current-password" {...form.register('password')} className="field-control" />
        </div>
        {form.formState.errors.root && <p className="error-message">{String(form.formState.errors.root.message)}</p>}
        <button type="submit" className="primary-button w-full" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-sm text-[var(--muted)]">
        Need an account?{' '}
        <Link href="/register" className="font-medium text-blue-400">
          Register here
        </Link>
      </p>
    </div>
  );
}
