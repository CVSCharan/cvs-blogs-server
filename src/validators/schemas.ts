import { z } from 'zod';

// ─── Auth ──────────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100),
    email: z.string().email('Invalid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Password must contain at least one number'),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
  }),
});

// ─── Post ──────────────────────────────────────────────────────────────────────

export const createPostSchema = z.object({
  body: z.object({
    title: z.string().min(3, 'Title must be at least 3 characters').max(200),
    content: z.string().min(10, 'Content must be at least 10 characters'),
    excerpt: z.string().max(500).optional(),
    published: z.boolean().optional().default(false),
    tags: z.array(z.string()).optional().default([]),
  }),
});

export const updatePostSchema = z.object({
  body: z.object({
    title: z.string().min(3).max(200).optional(),
    content: z.string().min(10).optional(),
    excerpt: z.string().max(500).optional(),
    published: z.boolean().optional(),
    tags: z.array(z.string()).optional(),
  }),
});

// ─── Inferred Types ────────────────────────────────────────────────────────────

export type RegisterInput = z.infer<typeof registerSchema>['body'];
export type LoginInput = z.infer<typeof loginSchema>['body'];
export type CreatePostInput = z.infer<typeof createPostSchema>['body'];
export type UpdatePostInput = z.infer<typeof updatePostSchema>['body'];
