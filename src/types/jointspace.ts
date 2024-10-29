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
