import type { ApiResult, getHttpDigestClient } from '../http-clients/http-digest-client';
import {
  ambilightBrightnessChoicesSchema,
  ambilightFollowAudioModeSchema,
  ambilightFollowVideoModeSchema,
  ambilightModesSchema,
} from '../schemas/jointspace.schema';
import type {
  AmbiHueState,
  AmbilightBrightnessChoices,
  AmbilightCurrentConfiguration,
  AmbilightFollowAudioMode,
  AmbilightFollowVideoMode,
  AmbilightMode,
  AmbilightModeResponse,
  AmbilightPixelData,
  MenuSettingValue,
  RGBColor,
} from '../types';
import { buildErrorApi } from '../utils/error';
import { type GetFullAmbilightInformationResult, handleGetFullInformation } from './ambilight/getFullInformation';
import type { MenuApi } from './MenuApi';

/**
 * Provides methods to interact with the Ambilight context,
 * including brightness control, mode management, and configuration retrieval.
 */
export class AmbilightApi {
  /** @internal */
  constructor(
    private readonly digestClient: ReturnType<typeof getHttpDigestClient>,
    private readonly menuApi: MenuApi,
  ) {}

  async setAmbilightBrightness(brightness: AmbilightBrightnessChoices): Promise<ApiResult> {
    try {
      const _brightness = ambilightBrightnessChoicesSchema.parse(brightness);
      const flatNode = await this.menuApi.getMenuStructureItem('ambilight_brightness');

      if (!flatNode.success) {
        return { success: false, error: flatNode.error ?? new Error('Failed to fetch menu structure item') };
      }

      return this.menuApi.setMenuItemSetting(flatNode.data, Number(_brightness));
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }

  async getAmbilightBrightnessInformation(): Promise<ApiResult<MenuSettingValue['value']>> {
    const itemRes = await this.menuApi.getMenuStructureItem('ambilight_brightness');

    if (!itemRes.success) {
      return { success: false, error: itemRes.error };
    }

    if (!itemRes.data?.node_id) {
      return { success: false, error: new Error('Failed to fetch menu structure item') };
    }

    const valuesRes = await this.menuApi.getCurrentSetting(itemRes.data.node_id);

    if (!valuesRes.success) {
      return { success: false, error: valuesRes.error };
    }

    return { success: true, data: valuesRes.data?.[0]?.value };
  }

  async getBrightnessValue(): Promise<ApiResult<number>> {
    const infoRes = await this.getAmbilightBrightnessInformation();

    if (infoRes.success) {
      const info = infoRes.data;
      const rawValue = info?.data?.value ?? 0;

      return { success: true, data: Number(rawValue) };
    }

    return { success: false, error: new Error('Failed to fetch ambilight brightness value') };
  }

  async increaseBrightness(): Promise<ApiResult> {
    const currentRes = await this.getBrightnessValue();

    if (!currentRes.success) {
      return currentRes;
    }

    const computedBrightness = Number(currentRes.data) + 1;
    const realBrightness = Math.min(10, Math.max(0, computedBrightness)) as AmbilightBrightnessChoices;

    return this.setAmbilightBrightness(realBrightness);
  }

  async decreaseBrightness() {
    const currentRes = await this.getBrightnessValue();

    if (!currentRes.success) {
      return currentRes;
    }

    const computedBrightness = Number(currentRes.data) - 1;
    const realBrightness = Math.min(10, Math.max(0, computedBrightness)) as AmbilightBrightnessChoices;

    return this.setAmbilightBrightness(realBrightness);
  }

  getMode(): Promise<ApiResult<AmbilightModeResponse>> {
    return this.digestClient.request('ambilight/mode');
  }

  setMode(mode: AmbilightMode): Promise<ApiResult<''>> {
    const _mode = ambilightModesSchema.parse(mode);

    return this.digestClient.request('ambilight/mode', {
      method: 'POST',
      data: {
        current: _mode,
      },
    });
  }

  async getFullInformation(): Promise<ApiResult<GetFullAmbilightInformationResult>> {
    try {
      const result = await handleGetFullInformation(this);

      return { success: true, data: result };
    } catch (e) {
      return buildErrorApi(e);
    }
  }

  protected async setCurrentConfiguration(options: AmbilightCurrentConfiguration): Promise<ApiResult<''>> {
    try {
      return this.digestClient.request('ambilight/currentconfiguration', {
        method: 'POST',
        data: {
          styleName: options.styleName,
          isExpert: false,
          menuSetting: options.menuSetting,
        },
      });
    } catch (err) {
      return buildErrorApi(err);
    }
  }

  async setFollowVideoMode(mode: AmbilightFollowVideoMode): Promise<ApiResult<''>> {
    try {
      const _mode = ambilightFollowVideoModeSchema.parse(mode);

      return this.setCurrentConfiguration({
        styleName: 'FOLLOW_VIDEO',
        isExpert: false,
        menuSetting: _mode,
      });
    } catch (err) {
      return buildErrorApi(err);
    }
  }

  async setFollowAudioMode(mode: AmbilightFollowAudioMode): Promise<ApiResult<''>> {
    const _mode = ambilightFollowAudioModeSchema.parse(mode);

    return this.setCurrentConfiguration({
      styleName: 'FOLLOW_AUDIO',
      isExpert: false,
      menuSetting: _mode,
    });
  }

  async turnOff(): Promise<ApiResult<''>> {
    return this.setCurrentConfiguration({
      styleName: 'OFF',
      isExpert: false,
    });
  }

  async turnOn(hexColor: string): Promise<ApiResult<''>> {
    const hex = hexColor.replace('#', '');
    const r = Number.parseInt(hex.substring(0, 2), 16);
    const g = Number.parseInt(hex.substring(2, 4), 16);
    const b = Number.parseInt(hex.substring(4, 6), 16);

    await this.setMode('manual');

    return this.setCachedColor({ r, g, b });
  }

  async setCachedColor(data: AmbilightPixelData | RGBColor): Promise<ApiResult<''>> {
    return this.digestClient.request('ambilight/cached', {
      method: 'POST',
      data,
    });
  }

  getCachedState(): Promise<ApiResult<AmbilightPixelData>> {
    return this.digestClient.request('ambilight/cached');
  }

  getAmbiHue(): Promise<ApiResult<AmbiHueState>> {
    return this.digestClient.request('HueLamp/power');
  }

  getConfiguration(): Promise<ApiResult<AmbilightCurrentConfiguration>> {
    return this.digestClient.request('ambilight/currentconfiguration');
  }
}
