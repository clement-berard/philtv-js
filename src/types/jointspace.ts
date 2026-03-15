import type { z } from 'zod';
import type {
  ambilightBrightnessChoicesSchema,
  ambilightFollowAudioModeSchema,
  ambilightFollowVideoModeSchema,
  ambilightModesSchema,
  inputKeysSchema,
} from '../schemas/jointspace.schema';
import type { SystemInfo } from './jointspace-api.types';

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

export type SystemInfoEnriched = SystemInfo & {
  fullApiVersion: string; // ex: "6.2.0"
};

export type FlatNodeType = 'SLIDER_NODE' | 'LIST_NODE' | 'TOGGLE_NODE' | (string & {});
