import { z } from 'zod';
import { NAMEABLE_ROLES } from './roles.ts';

/** One schema checks input in the browser and again on the server (architecture §4.3). */

/** Provisional: to be set from the longest part number in the real ERP (FDE decision, 2026-09-26). */
export const PART_NUMBER_MAX_LENGTH = 64;

export const partNumberSchema = z
  .string()
  .trim()
  .min(1, 'Enter a part number')
  .max(PART_NUMBER_MAX_LENGTH, `A part number is at most ${PART_NUMBER_MAX_LENGTH} characters`);

export const addProductSchema = z.object({
  partNumber: partNumberSchema,
  description: z.string().trim().min(1, 'Enter a description').max(500),
  price: z.string().max(32),
});
export type AddProductInput = z.infer<typeof addProductSchema>;

export const changePriceSchema = z.object({
  price: z.string().max(32),
});
export type ChangePriceInput = z.infer<typeof changePriceSchema>;

export const setStandardDiscountSchema = z.object({
  percent: z.string().max(16),
});
export type SetStandardDiscountInput = z.infer<typeof setStandardDiscountSchema>;

export const nameUserSchema = z.object({
  internalUserId: z.number().int().positive(),
  role: z.enum(NAMEABLE_ROLES),
});
export type NameUserInput = z.infer<typeof nameUserSchema>;
