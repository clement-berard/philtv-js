import type {
  AmbiHueState,
  AmbilightCurrentConfiguration,
  AmbilightModeResponse,
  AmbilightPixelData,
  MenuSettingValueInner,
} from '../../../types';
import type { AmbilightApi } from '../AmbilightApi';

export type GetFullAmbilightInformationResult = {
  configuration: AmbilightCurrentConfiguration | null;
  brightness: MenuSettingValueInner | null;
  currentBrightness: number | null;
  mode: AmbilightModeResponse | null;
  cached: AmbilightPixelData | null;
  ambiHue: AmbiHueState | null;
};

export async function handleGetFullInformation(
  ambilightInstance: AmbilightApi,
): Promise<GetFullAmbilightInformationResult> {
  const [configuration, brightness, mode, cached, ambiHue] = await Promise.all([
    ambilightInstance.getConfiguration(),
    ambilightInstance.getBrightnessInformation(),
    ambilightInstance.getMode(),
    ambilightInstance.getCachedState(),
    ambilightInstance.getAmbiHue(),
  ]);

  return {
    configuration: configuration ?? null,
    mode: mode ?? null,
    brightness: brightness ?? null,
    currentBrightness: Number(brightness.data?.value ?? 0),
    cached: cached ?? null,
    ambiHue: ambiHue ?? null,
  };
}
