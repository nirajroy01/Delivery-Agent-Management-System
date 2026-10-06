'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { register } from '@/lib/api';

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
  const form = useForm({ resolver: zodResolver(schema) });

  const onSubmit = async (values: any) => {
    try {
      await register({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      router.push('/login');
    } catch (error: any) {
      form.setError('root', { message: error?.response?.data?.error?.message || 'Registration failed' });
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-xl border bg-white p-8 shadow-sm">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">Register</h1>
      <form className="space-y-4" onSubmit={form.handleSubmit(onSubmit)}>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
          <input {...form.register('name')} className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
          <input type="email" {...form.register('email')} className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
          <input type="password" {...form.register('password')} className="w-full rounded border px-3 py-2" />
        </div>
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">Confirm Password</label>
          <input type="password" {...form.register('confirmPassword')} className="w-full rounded border px-3 py-2" />
        </div>
        {form.formState.errors.root && <p className="text-sm text-red-600">{String(form.formState.errors.root.message)}</p>}
        <button type="submit" className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-blue-600">
          Login here
        </Link>
      </p>
    </div>
  );
}
