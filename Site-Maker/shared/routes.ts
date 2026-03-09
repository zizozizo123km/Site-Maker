import { z } from 'zod';
import { conversations, messages } from './schema';

export const errorSchemas = {
  validation: z.object({ message: z.string(), field: z.string().optional() }),
  notFound: z.object({ message: z.string() }),
  internal: z.object({ message: z.string() }),
};

export const api = {
  conversations: {
    list: {
      method: 'GET' as const,
      path: '/api/conversations' as const,
      responses: {
        200: z.array(z.custom<typeof conversations.$inferSelect>()),
      },
    },
    get: {
      method: 'GET' as const,
      path: '/api/conversations/:id' as const,
      responses: {
        200: z.object({
          conversation: z.custom<typeof conversations.$inferSelect>(),
          messages: z.array(z.custom<typeof messages.$inferSelect>()),
        }),
        404: errorSchemas.notFound,
      },
    },
    create: {
      method: 'POST' as const,
      path: '/api/conversations' as const,
      input: z.object({ title: z.string().optional() }).optional(),
      responses: {
        201: z.custom<typeof conversations.$inferSelect>(),
      },
    },
    delete: {
      method: 'DELETE' as const,
      path: '/api/conversations/:id' as const,
      responses: {
        204: z.void(),
        404: errorSchemas.notFound,
      },
    },
    chat: {
      method: 'POST' as const,
      path: '/api/conversations/:id/chat' as const,
      input: z.object({ content: z.string() }),
      responses: {
        200: z.object({
          message: z.custom<typeof messages.$inferSelect>(),
          conversation: z.custom<typeof conversations.$inferSelect>(),
        }),
        400: errorSchemas.validation,
        404: errorSchemas.notFound,
        500: errorSchemas.internal,
      },
    }
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}
