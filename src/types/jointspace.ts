import type { JOINTSPACE_CONSTANTS } from '../constants';

export type InputKeys = (typeof JOINTSPACE_CONSTANTS.inputKeys)[number];

export type AmbilightFollowVideoMode = (typeof JOINTSPACE_CONSTANTS.ambilight.followVideoMode)[number] | string;

export type AmbilightFollowAudioMode = (typeof JOINTSPACE_CONSTANTS.ambilight.followAudioMode)[number];

export type AmbilightChangeBrightnessAvailableValues =
  | (typeof JOINTSPACE_CONSTANTS.ambilight.brightnessAvailableValues)[number]
  | string;
