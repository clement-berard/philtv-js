import type { JOINTSPACE_CONSTANTS } from '../constants';

export type InputKeys = (typeof JOINTSPACE_CONSTANTS.inputKeys)[number];

export type AmbilightFollowVideoMode = (typeof JOINTSPACE_CONSTANTS.ambilight.followVideoMode)[number] | string;

export type AmbilightFollowAudioMode = (typeof JOINTSPACE_CONSTANTS.ambilight.followAudioMode)[number];

export type AmbilightChangeBrightnessAvailableValues =
  (typeof JOINTSPACE_CONSTANTS.ambilight.ambilightChangeBrightnessAvailableValues)[number];

export type AmbilightSetBrightnessAvailableValues =
  (typeof JOINTSPACE_CONSTANTS.ambilight.ambilightBrightnessAvailableValues)[number];
