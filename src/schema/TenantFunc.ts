import { z } from "zod";

export const updateTenantFuncSchema = z.object({
  domClose: z.string().min(4).optional(),
  domOpen: z.string().min(4).optional(),
  terClose: z.string().min(4).optional(),
  terOpen: z.string().min(4).optional(),
  quarClose: z.string().min(4).optional(),
  quarOpen: z.string().min(4).optional(),
  quinClose: z.string().min(4).optional(),
  quinOpen: z.string().min(4).optional(),
  sexClose: z.string().min(4).optional(),
  sexOpen: z.string().min(4).optional(),
  sabClose: z.string().min(4).optional(),
  sabOpen: z.string().min(4).optional(),
  segClose: z.string().min(4).optional(),
  segOpen: z.string().min(4).optional(),
});

export const createTenantFuncSchema = z.object({
  domClose: z.string(),
  domOpen: z.string(),
  terClose: z.string(),
  terOpen: z.string(),
  quarClose: z.string(),
  quarOpen: z.string(),
  quinClose: z.string(),
  quinOpen: z.string(),
  sexClose: z.string(),
  sexOpen: z.string(),
  sabClose: z.string(),
  sabOpen: z.string(),
  segClose: z.string(),
  segOpen: z.string(),
});
