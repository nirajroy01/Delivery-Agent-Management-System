'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { login } from '@/lib/api';
import { saveAuthSession } from '@/lib/auth';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export default function LoginPage() {
  const router = useRouter();
  const form = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values: any) => {
    try {
      const response = await login(values);
      saveAuthSession(response.data.token, response.data.user);
      router.push('/dashboard');
    } catch (error: any) {
      form.setError('root', { message: error?.response?.data?.error?.message || 'Login failed' });
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Login</h1>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input type="email" {...form.register('email')} className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input type="password" {...form.register('password')} className="w-full rounded border px-3 py-2" />
        </div>
        {form.formState.errors.root && <p className="text-sm text-red-600">{String(form.formState.errors.root.message)}</p>}
        <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Signing in...' : 'Login'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Need an account?{' '}
        <Link href="/register" className="font-medium text-blue-600">
          Register here
        </Link>
      </p>
    </div>
  );
}
