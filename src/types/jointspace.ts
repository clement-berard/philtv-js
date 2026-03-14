import type { z } from 'zod';
import type {
  ambilightBrightnessChoicesSchema,
  ambilightFollowAudioModeSchema,
  ambilightFollowVideoModeSchema,
  ambilightModesSchema,
  inputKeysSchema,
} from '../schemas/jointspace.schema';

/** @internal */
export type InputKeys = z.infer<typeof inputKeysSchema>;

/** @internal */
export type AmbilightFollowVideoMode = z.infer<typeof ambilightFollowVideoModeSchema>;

/** @internal */
export type AmbilightFollowAudioMode = z.infer<typeof ambilightFollowAudioModeSchema>;

/** @internal */
export type AmbilightBrightnessChoices = z.infer<typeof ambilightBrightnessChoicesSchema>;

/** @internal */
export type AmbilightModes = z.infer<typeof ambilightModesSchema>;
