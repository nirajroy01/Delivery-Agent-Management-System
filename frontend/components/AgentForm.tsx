'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Agent, CreateAgentInput } from '@/types/agent';

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
  onSubmit: (values: CreateAgentInput) => Promise<void> | void;
  submitLabel: string;
}) {
  const form = useForm<CreateAgentInput>({
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">Full Name <span className="text-rose-400">*</span></label>
        <input {...form.register('fullName')} autoComplete="name" className="field-control" />
        {form.formState.errors.fullName && <p className="mt-1 text-sm text-rose-400">{form.formState.errors.fullName.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">Phone Number <span className="text-rose-400">*</span></label>
        <input {...form.register('phoneNumber')} type="tel" autoComplete="tel" className="field-control" />
        {form.formState.errors.phoneNumber && <p className="mt-1 text-sm text-rose-400">{form.formState.errors.phoneNumber.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">Email Address <span className="text-rose-400">*</span></label>
        <input type="email" autoComplete="email" {...form.register('email')} className="field-control" />
        {form.formState.errors.email && <p className="mt-1 text-sm text-rose-400">{form.formState.errors.email.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">Service Area <span className="text-rose-400">*</span></label>
        <input {...form.register('serviceArea')} autoComplete="address-level2" className="field-control" />
        {form.formState.errors.serviceArea && <p className="mt-1 text-sm text-rose-400">{form.formState.errors.serviceArea.message}</p>}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-[var(--text)]">Status <span className="text-rose-400">*</span></label>
        <select {...form.register('status')} className="field-control">
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </select>
      </div>
      </div>

      <button type="submit" className="primary-button" disabled={form.formState.isSubmitting}>
        {form.formState.isSubmitting ? 'Saving...' : submitLabel}
      </button>
    </form>
  );
}
