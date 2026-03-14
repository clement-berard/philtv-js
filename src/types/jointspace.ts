import type { z } from 'zod';
import type {
  ambilightBrightnessChoicesSchema,
  ambilightFollowAudioModeSchema,
  ambilightFollowVideoModeSchema,
  ambilightModesSchema,
  inputKeysSchema,
} from '../schemas/jointspace.schema';

export type InputKeys = z.infer<typeof inputKeysSchema>;

export type AmbilightFollowVideoMode = z.infer<typeof ambilightFollowVideoModeSchema>;

export type AmbilightFollowAudioMode = z.infer<typeof ambilightFollowAudioModeSchema>;

export type AmbilightBrightnessChoices = z.infer<typeof ambilightBrightnessChoicesSchema>;

export type AmbilightModes = z.infer<typeof ambilightModesSchema>;
