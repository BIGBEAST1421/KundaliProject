/** Request-body schemas shared by the API routes and the forms. */
import { z } from "zod";
import { PillarSchema, LanguageSchema } from "./types";

export const PersonInputSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(80),
  dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date of birth is required"),
  time: z.string().regex(/^(\d{2}:\d{2})?$/).default(""),
  timeKnown: z.boolean().default(false),
  city: z.string().trim().min(1, "Place of birth is required"),
  state: z.string().trim().default(""),
  country: z.string().trim().default("India"),
  lat: z.number().min(-90).max(90).nullable().optional(),
  lon: z.number().min(-180).max(180).nullable().optional(),
});
export type PersonInput = z.infer<typeof PersonInputSchema>;

export const CreateReportSchema = PersonInputSchema.extend({
  gender: z.string().trim().default(""),
  occupation: z.string().trim().default(""),
  maritalStatus: z.string().trim().default("Unmarried"),
  pillars: z.array(PillarSchema).default([]),
  language: LanguageSchema.default("en"),
});
export type CreateReportInput = z.infer<typeof CreateReportSchema>;

export const CreateMatchSchema = z.object({
  boy: PersonInputSchema,
  girl: PersonInputSchema,
  language: LanguageSchema.default("en"),
});
export type CreateMatchInput = z.infer<typeof CreateMatchSchema>;
