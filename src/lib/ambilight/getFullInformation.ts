import type {
  AmbiHueState,
  AmbilightCurrentConfiguration,
  AmbilightModeResponse,
  AmbilightPixelData,
  MenuSettingValue,
} from '../../types';
import type { AmbilightApi } from '../AmbilightApi';

export type GetFullAmbilightInformationResult = {
  configuration: AmbilightCurrentConfiguration | null;
  brightness: MenuSettingValue['value'] | null;
  mode: AmbilightModeResponse | null;
  cached: AmbilightPixelData | null;
  ambiHue: AmbiHueState | null;
};

export async function handleGetFullInformation(
  ambilightInstance: AmbilightApi,
): Promise<GetFullAmbilightInformationResult> {
  const [configuration, brightness, mode, cached, ambiHue] = await Promise.all([
    ambilightInstance.getConfiguration(),
    ambilightInstance.getAmbilightBrightnessInformation(),
    ambilightInstance.getMode(),
    ambilightInstance.getCachedState(),
    ambilightInstance.getAmbiHue(),
  ]);

  return {
    configuration: configuration.success ? configuration.data : null,
    mode: mode.success ? mode.data : null,
    brightness: brightness.success ? brightness.data : null,
    cached: cached.success ? cached.data : null,
    ambiHue: ambiHue.success ? ambiHue.data : null,
  };
}
