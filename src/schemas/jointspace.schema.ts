import { z } from 'zod';
import {
  ambilightBrightnessChoices,
  ambilightFollowAudioModeEnum,
  ambilightFollowVideoModeEnum,
  ambilightModes,
  inputKeys,
} from '../constants/jointspace.constant';

export const inputKeysSchema = z.enum(inputKeys);
export const ambilightFollowVideoModeSchema = z.enum(ambilightFollowVideoModeEnum);
export const ambilightFollowAudioModeSchema = z.enum(ambilightFollowAudioModeEnum);
export const ambilightBrightnessChoicesSchema = z.literal(ambilightBrightnessChoices);
export const ambilightModesSchema = z.enum(ambilightModes);
