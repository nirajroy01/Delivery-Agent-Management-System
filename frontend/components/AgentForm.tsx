'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Agent, CreateAgentInput, UpdateAgentInput } from '@/types/agent';

const schema = z.object({
  fullName: z.string().min(2),
  phoneNumber: z.string().min(8),
  email: z.string().email(),
  serviceArea: z.string().min(2),
  status: z.enum(['ACTIVE', 'INACTIVE']),
});

export default function AgentForm({
  initialValues,
  onSubmit,
  submitLabel,
}: {
  initialValues?: Partial<Agent>;
  onSubmit: (values: any) => Promise<void> | void;
  submitLabel: string;
}) {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: initialValues?.fullName || '',
      phoneNumber: initialValues?.phoneNumber || '',
      email: initialValues?.email || '',
      serviceArea: initialValues?.serviceArea || '',
      status: initialValues?.status || 'ACTIVE',
    },
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Full Name</label>
        <input {...form.register('fullName')} className="w-full rounded border px-3 py-2" />
        {form.formState.errors.fullName && <p className="mt-1 text-sm text-red-600">{form.formState.errors.fullName.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Phone Number</label>
        <input {...form.register('phoneNumber')} className="w-full rounded border px-3 py-2" />
        {form.formState.errors.phoneNumber && <p className="mt-1 text-sm text-red-600">{form.formState.errors.phoneNumber.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
        <input type="email" {...form.register('email')} className="w-full rounded border px-3 py-2" />
        {form.formState.errors.email && <p className="mt-1 text-sm text-red-600">{form.formState.errors.email.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Service Area</label>
        <input {...form.register('serviceArea')} className="w-full rounded border px-3 py-2" />
        {form.formState.errors.serviceArea && <p className="mt-1 text-sm text-red-600">{form.formState.errors.serviceArea.message}</p>}
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-slate-700">Status</label>
        <select {...form.register('status')} className="w-full rounded border px-3 py-2">
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>

      <button type="submit" className="rounded bg-blue-600 px-4 py-2 text-white" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
