// ============================================================
// JointSpace API v6 - TypeScript Types
// Based on official docs + community reverse-engineering
// ============================================================

// ----------------------------------------------------------------
// Shared / Primitives
// ----------------------------------------------------------------

import type { AmbilightFollowAudioMode, AmbilightFollowVideoMode, AmbilightMode, InputKey } from './jointspace';

export type PowerState = 'On' | 'Off' | 'Standby';

export type RGBColor = {
  r: number;
  g: number;
  b: number;
};

export type HSBColor = {
  hue: number;
  saturation: number;
  brightness: number;
};

// ----------------------------------------------------------------
// System
// ----------------------------------------------------------------

export type ApiVersion = {
  Major: number;
  Minor: number;
  Patch: number;
};

export type JsonFeatures = {
  editfavorites?: string[];
  recordings?: string[];
  ambilight?: string[];
  menuitems?: string[];
  textentry?: string[];
  applications?: string[];
  pointer?: string[];
  inputkey?: string[];
  activities?: string[];
  channels?: string[];
  mappings?: string[];
};

export type SystemFeatures = {
  tvtype?: 'consumer' | 'professional';
  content?: string[];
  tvsearch?: string;
  pairing_type?: 'digest_auth_pairing' | 'none';
  secured_transport?: 'true' | 'false';
};

export type SystemFeaturing = {
  jsonfeatures?: JsonFeatures;
  systemfeatures?: SystemFeatures;
};

export type SystemInfo = {
  menulanguage: string;
  name: string;
  country: string;
  serialnumber_encrypted?: string;
  softwareversion_encrypted?: string;
  model_encrypted?: string;
  deviceid_encrypted?: string;
  serialnumber?: string;
  softwareversion?: string;
  model?: string;
  deviceid?: string;
  nettvversion?: string;
  epgsource?: string;
  api_version: ApiVersion;
  featuring: SystemFeaturing;
};

export type SystemInfoEnriched = SystemInfo & {
  fullApiVersion: string;
};

// ----------------------------------------------------------------
// Audio
// ----------------------------------------------------------------

export type AudioVolume = {
  muted: boolean;
  current: number;
  min: number;
  max: number;
};

export type AudioVolumeUpdate = {
  muted?: boolean;
  current?: number;
};

// ----------------------------------------------------------------
// Input keys
// ----------------------------------------------------------------

export type InputKeyPayload = {
  key: InputKey;
};

// ----------------------------------------------------------------
// Sources
// ----------------------------------------------------------------

export type Source = {
  id: string;
  name?: string;
};

export type SourceList = {
  version: number;
  sources: Record<string, Source>;
};

export type CurrentSource = {
  id: string;
};

// ----------------------------------------------------------------
// Channels
// ----------------------------------------------------------------

export type Channel = {
  ccid: number;
  preset: string;
  name: string;
};

export type ChannelList = {
  id: string;
  version: string;
  Channel: Channel[];
};

export type ChannelListSummary = {
  id: string;
  version: string;
  listType: string;
  medium: 'mixed' | 'cable' | 'satellite' | 'antenna';
  active: boolean;
  operator?: string;
  installCountry?: string;
};

export type ChannelLists = {
  version: number;
  channellists: ChannelListSummary[];
};

export type CurrentChannel = {
  channel: Channel;
  channelList: {
    id: string;
    version: string;
  };
};

export type SetCurrentChannel = {
  channel: Pick<Channel, 'ccid'>;
  channelList: {
    id: string;
    version: string;
  };
};

// ----------------------------------------------------------------
// Ambilight - Topology
// ----------------------------------------------------------------

export type AmbilightTopology = {
  layers: string | number;
  left: number;
  top: number;
  bottom: number;
  right: number;
};

// ----------------------------------------------------------------
// Ambilight - Mode
// ----------------------------------------------------------------

export type AmbilightModeResponse = {
  current: AmbilightMode;
};

export type AmbilightModePayload = {
  current: AmbilightMode;
};

// ----------------------------------------------------------------
// Ambilight - Pixel data (cached / measured / processed)
// ----------------------------------------------------------------

export type AmbilightSide = Record<string, RGBColor>;

export type AmbilightLayer = {
  left?: AmbilightSide;
  top?: AmbilightSide;
  right?: AmbilightSide;
  bottom?: AmbilightSide;
};

export type AmbilightPixelData = {
  layer1: AmbilightLayer;
  layer2?: AmbilightLayer;
  layer3?: AmbilightLayer;
};

// ----------------------------------------------------------------
// Ambilight - Current Configuration (style)
// ----------------------------------------------------------------

export type AmbilightStyleName =
  | 'OFF'
  | 'FOLLOW_VIDEO'
  | 'FOLLOW_AUDIO'
  | 'FOLLOW_COLOR'
  | 'LOUNGE'
  | 'MANUAL'
  | 'EXPERT'
  | 'GRID';

export type AmbilightFollowColorAlgorithm = 'MANUAL_HUE' | 'AUTOMATIC_HUE';

export type AmbilightCurrentConfiguration = {
  styleName: AmbilightStyleName;
  isExpert: boolean;
  menuSetting?: AmbilightFollowVideoMode | AmbilightFollowAudioMode | AmbilightFollowColorAlgorithm | string;
  stringValue?: string;
  algorithm?: AmbilightFollowAudioMode | AmbilightFollowColorAlgorithm;
};

// ----------------------------------------------------------------
// Ambilight - Supported Styles
// ----------------------------------------------------------------

export type AmbilightSupportedStyle = {
  styleName: AmbilightStyleName;
  algorithms?: string[];
  maxTuning?: number;
  maxSpeed?: number;
};

export type AmbilightSupportedStyles = {
  supportedStyles: AmbilightSupportedStyle[];
};

// ----------------------------------------------------------------
// Ambilight - Power
// ----------------------------------------------------------------

export type AmbilightPower = {
  power: 'On' | 'Off';
};

// ----------------------------------------------------------------
// Ambilight - Lounge
// ----------------------------------------------------------------

export type AmbilightLounge = {
  color: HSBColor;
  colordelta: HSBColor;
  speed: number;
  mode: 'Default' | string;
};

// ----------------------------------------------------------------
// Ambilight - Hue
// ----------------------------------------------------------------

export type AmbiHueState = {
  power?: 'On' | 'Off';
  [key: string]: unknown;
};

// ----------------------------------------------------------------
// Applications (Android TV only)
// ----------------------------------------------------------------

export type AppIntent = {
  action: string;
  component: {
    packageName: string;
    className: string;
  };
};

export type Application = {
  label: string;
  id: string;
  order?: number;
  type?: string;
  intent?: AppIntent;
};

export type ApplicationList = {
  version?: number;
  applications: Application[];
};

// ----------------------------------------------------------------
// Activities (Android TV only)
// ----------------------------------------------------------------

export type ActivityComponent = {
  packageName: string;
  className: string;
};

export type ActivityIntent = {
  action?: string;
  data?: string;
  component: ActivityComponent;
};

export type CurrentActivity = { component: ActivityComponent } | { channel: CurrentChannel };

// ----------------------------------------------------------------
// Power state (Android TV / API v6+)
// ----------------------------------------------------------------

export type PowerStateResponse = {
  powerstate: PowerState;
};

export type PowerStatePayload = {
  powerstate: PowerState;
};

// ----------------------------------------------------------------
// Menu Items / Settings (API v6)
// ----------------------------------------------------------------

export type FlatNodeType = 'SLIDER_NODE' | 'LIST_NODE' | 'TOGGLE_NODE' | (string & {});

/** @internal */
export type MenuItemNode = {
  node_id: number;
  type: FlatNodeType;
  string_id?: string;
  context?: string;
  data?: unknown;
};

// GET /menuitems/settings/structure
export type MenuItemsSettingsResponse = {
  version: number;
  node: MenuItemNode;
};

// POST /menuitems/settings/current - request
export type MenuItemsSettingsRequest = {
  nodes: Array<{ nodeid: number }>;
};

// POST /menuitems/settings/current - response
export type MenuSettingValueData = Record<string, unknown>;

export type MenuSettingValue = {
  value: {
    Nodeid: number;
    Controllable?: 'true' | 'false';
    Available?: 'true' | 'false';
    data?: MenuSettingValueData;
  };
};

export type MenuItemsCurrentResponseNode = {
  version: number;
  values: MenuSettingValue[];
};

// POST /menuitems/settings/update - request
export type MenuItemsSettingsValue = {
  value: {
    Nodeid: number;
    Controllable?: 'true' | 'false';
    Available?: 'true' | 'false';
    data?: unknown;
  };
};

export type MenuItemsSettingsUpdatePayload = {
  values: MenuItemsSettingsValue[];
};

// ----------------------------------------------------------------
// Pairing (Android TV / digest_auth_pairing)
// ----------------------------------------------------------------

export type PairingRequestPayload = {
  scope: string[];
  device: {
    app_id: string;
    id: string;
    device_name: string;
    device_os: string;
    app_name: string;
    type: string;
  };
};

export type PairingRequestResponse = {
  error_id: 'SUCCESS' | string;
  error_text: string;
  auth_key?: string;
  timestamp?: number;
  timeout?: number;
};

export type PairingGrantPayload = {
  auth: {
    pin: string;
    auth_timestamp: number;
    auth_signature: string;
  };
  device: {
    app_id: string;
    id: string;
    device_name: string;
    device_os: string;
    app_name: string;
    type: string;
  };
};

export type PairingGrantResponse = {
  error_id: 'SUCCESS' | string;
  error_text: string;
  auth_key?: string;
};

// ----------------------------------------------------------------
// Google Assistant (Android TV only)
// ----------------------------------------------------------------

export type GoogleAssistantPayload = {
  query: string;
};
