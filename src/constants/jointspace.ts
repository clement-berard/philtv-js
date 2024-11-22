const inputKeys = [
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

const ambilightFollowVideoModeEnum = ['COMFORT', 'GAME', 'IMMERSIVE', 'NATURAL', 'RELAX', 'STANDARD', 'VIVID'] as const;

const ambilightFollowAudioModeEnum = [
  'ENERGY_ADAPTIVE_BRIGHTNESS',
  'ENERGY_ADAPTIVE_COLORS',
  'KNIGHT_RIDER_ALTERNATING',
  'MODE_RANDOM',
  'RANDOM_PIXEL_FLASH',
  'SPECTRUM_ANALYSER',
  'VU_METER',
] as const;

const ambilightBrightnessAvailableValuesIntegers = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;
const ambilightChangeBrightnessAvailableValuesStrings = ['increase', 'decrease'] as const;
const ambilightBrightnessAvailableValuesStrings = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'] as const;
const ambilightBrightnessAvailableValues = [
  ...ambilightBrightnessAvailableValuesIntegers,
  ...ambilightBrightnessAvailableValuesStrings,
] as const;
const ambilightChangeBrightnessAvailableValues = [
  ...ambilightBrightnessAvailableValuesIntegers,
  ...ambilightBrightnessAvailableValuesStrings,
  ...ambilightChangeBrightnessAvailableValuesStrings,
] as const;

const ambilightChangeBrightnessAvailableSinglesValues = [
  ...ambilightBrightnessAvailableValuesStrings,
  ...ambilightChangeBrightnessAvailableValuesStrings,
] as const;

export const JOINTSPACE_CONSTANTS = {
  ambilight: {
    followAudioMode: ambilightFollowAudioModeEnum,
    followVideoMode: ambilightFollowVideoModeEnum,
    brightnessAvailableValues: ambilightChangeBrightnessAvailableValues,
    ambilightChangeBrightnessAvailableValues,
    ambilightBrightnessAvailableValues,
    ambilightChangeBrightnessAvailableSinglesValues,
  },
  inputKeys,
} as const;
