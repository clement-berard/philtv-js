import { list } from 'radash';

export const InputKeys = [
  'Adjust',
  'AmbilightOnOff',
  'Back',
  'BlueColour',
  'ChannelStepDown',
  'ChannelStepUp',
  'Confirm',
  'CursorDown',
  'CursorLeft',
  'CursorRight',
  'CursorUp',
  'Digit0',
  'Digit1',
  'Digit2',
  'Digit3',
  'Digit4',
  'Digit5',
  'Digit6',
  'Digit7',
  'Digit8',
  'Digit9',
  'Dot',
  'FastForward',
  'Find',
  'GreenColour',
  'Home',
  'Info',
  'Mute',
  'Next',
  'Online',
  'Options',
  'Pause',
  'PlayPause',
  'Previous',
  'Record',
  'RedColour',
  'Rewind',
  'Source',
  'Standby',
  'Stop',
  'Subtitle',
  'Teletext',
  'Viewmode',
  'VolumeDown',
  'VolumeUp',
  'WatchTV',
  'YellowColour',
] as const;

export type InputKeys = (typeof InputKeys)[number];

export const AmbilightFollowVideoModeEnum = [
  'COMFORT',
  'GAME',
  'IMMERSIVE',
  'NATURAL',
  'RELAX',
  'STANDARD',
  'VIVID',
] as const;

export type AmbilightFollowVideoMode = (typeof AmbilightFollowVideoModeEnum)[number] | string;

export const AmbilightFollowAudioModeEnum = [
  'ENERGY_ADAPTIVE_BRIGHTNESS',
  'ENERGY_ADAPTIVE_COLORS',
  'KNIGHT_RIDER_ALTERNATING',
  'MODE_RANDOM',
  'RANDOM_PIXEL_FLASH',
  'SPECTRUM_ANALYSER',
  'VU_METER',
] as const;

export type AmbilightFollowAudioMode = (typeof AmbilightFollowAudioModeEnum)[number];

export const ambilightChangeBrightnessAvailableValues = [
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  'increase',
  'decrease',
] as const;

export type AmbilightChangeBrightnessAvailableValues = (typeof ambilightChangeBrightnessAvailableValues)[number];
