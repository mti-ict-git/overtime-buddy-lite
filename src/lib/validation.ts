import { z } from 'zod';

// Employee validation schema
export const employeeSchema = z.object({
  employee_id: z.string()
    .trim()
    .min(3, 'Employee ID must be at least 3 characters')
    .max(20, 'Employee ID must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Employee ID can only contain letters, numbers, hyphens and underscores'),
  name: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[\p{L}\s'-]+$/u, 'Name can only contain letters, spaces, hyphens and apostrophes'),
});

// Overtime entry validation schema
export const overtimeSchema = z.object({
  employeeId: z.string()
    .trim()
    .min(3, 'Employee ID must be at least 3 characters')
    .max(20, 'Employee ID must be less than 20 characters')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Employee ID can only contain letters, numbers, hyphens and underscores'),
  overtimeDate: z.string()
    .min(1, 'Overtime date is required')
    .regex(/^\d{2}\.\d{2}\.\d{4}$/, 'Date must be in format DD.MM.YYYY'),
  planOvertimeHour: z.number()
    .min(0.5, 'Minimum overtime is 0.5 hours')
    .max(24, 'Maximum overtime is 24 hours'),
  fromTime: z.string()
    .min(1, 'Start time is required')
    .regex(/^\d{2}:\d{2}$/, 'Time must be in format HH:MM'),
  reason: z.string()
    .trim()
    .min(10, 'Reason must be at least 10 characters')
    .max(1000, 'Reason must be less than 1000 characters'),
});

// Password validation schema
export const passwordSchema = z.object({
  newPassword: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(100, 'Password must be less than 100 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// MS Graph settings validation schema (removed client_secret)
export const msGraphSchema = z.object({
  ms_graph_tenant_id: z.string()
    .trim()
    .min(1, 'Tenant ID is required')
    .max(100, 'Tenant ID too long')
    .regex(/^[a-zA-Z0-9-]+$/, 'Invalid Tenant ID format'),
  ms_graph_client_id: z.string()
    .trim()
    .min(1, 'Client ID is required')
    .max(100, 'Client ID too long')
    .regex(/^[a-zA-Z0-9-]+$/, 'Invalid Client ID format'),
});
