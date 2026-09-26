import { BadRequestException } from '@nestjs/common';
import type { z } from 'zod';

/** Checks a request body against the shared schema the browser also uses. */
export function parseBody<T extends z.ZodType>(schema: T, body: unknown): z.infer<T> {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw new BadRequestException(result.error.issues.map((issue) => issue.message).join('; '));
  }
  return result.data;
}
