import type { getHttpDigestClient } from '../http-clients/http-digest-client';
import {
  ambilightBrightnessChoicesSchema,
  ambilightFollowAudioModeSchema,
  ambilightFollowVideoModeSchema,
  ambilightModesSchema,
} from '../schemas/jointspace.schema';
import type {
  AmbilightBrightnessChoices,
  AmbilightFollowAudioMode,
  AmbilightFollowVideoMode,
  AmbilightModes,
} from '../types';
import type { MenuApi } from './MenuApi';

interface MenuSettingValue {
  value?: unknown;
  data?: {
    value?: string | number;
  };
}

export class AmbilightApi {
  constructor(
    private readonly digestClient: ReturnType<typeof getHttpDigestClient>,
    private readonly menuApi: MenuApi,
  ) {}

  async setAmbilightBrightness(brightness: AmbilightBrightnessChoices) {
    try {
      const _brightness = ambilightBrightnessChoicesSchema.parse(brightness);

      return this.menuApi.handleSetMenuItemSetting('ambilight_brightness', {
        value: Number(_brightness),
      });
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }

  async getCurrentSetting(nodeId: number) {
    const res = await this.digestClient.request<unknown[]>('menuitems/settings/current', {
      method: 'POST',
      data: { nodes: [{ nodeid: nodeId }] },
    });

    if (!res.success) {
      return res;
    }

    const node = res.data[1] as Record<string, unknown>;
    const values = node?.values as MenuSettingValue[];
    const hasValues = values?.length > 0;

    if (hasValues) {
      return { success: true, data: values };
    }

    return { success: false, error: new Error('menuitems/settings/current: No values') };
  }

  async getAmbilightBrightnessInformation() {
    const itemRes = await this.menuApi.getMenuStructureItem('ambilight_brightness');

    if (!itemRes.success) {
      return itemRes;
    }

    if (!itemRes.data?.node_id) {
      return { success: true, data: undefined };
    }

    const valuesRes = await this.getCurrentSetting(itemRes.data.node_id);

    if (!valuesRes.success) {
      return valuesRes;
    }

    return { success: true, data: valuesRes.data?.[0]?.value };
  }

  async getAmbilightBrightnessValue() {
    const infoRes = await this.getAmbilightBrightnessInformation();

    if (!infoRes.success) {
      return infoRes;
    }

    const info = infoRes.data as MenuSettingValue | undefined;
    const rawValue = info?.data?.value ?? 0;

    return { success: true, data: Number(rawValue) };
  }

  async increaseAmbilightBrightness() {
    const currentRes = await this.getAmbilightBrightnessValue();

    if (!currentRes.success) {
      return currentRes;
    }

    const computedBrightness = Number(currentRes.data) + 1;
    const realBrightness = Math.min(10, Math.max(0, computedBrightness)) as AmbilightBrightnessChoices;

    return this.setAmbilightBrightness(realBrightness);
  }

  async decreaseAmbilightBrightness() {
    const currentRes = await this.getAmbilightBrightnessValue();

    if (!currentRes.success) {
      return currentRes;
    }

    const computedBrightness = Number(currentRes.data) - 1;
    const realBrightness = Math.min(10, Math.max(0, computedBrightness)) as AmbilightBrightnessChoices;

    return this.setAmbilightBrightness(realBrightness);
  }

  getAmbilightMode() {
    return this.digestClient.request('ambilight/mode');
  }

  async getAmbilightFullInformation() {
    const [configuration, brightness, mode, cached, ambiHue] = await Promise.all([
      this.getAmbilightConfiguration(),
      this.getAmbilightBrightnessInformation(),
      this.getAmbilightMode(),
      this.getAmbilightCached(),
      this.getAmbiHue(),
    ]);

    return {
      success: true,
      data: {
        configuration,
        mode,
        brightness,
        cached,
        ambiHue,
      },
    };
  }

  protected async setAmbilightCurrentConfiguration(options: Record<string, unknown>) {
    return this.digestClient.request('ambilight/currentconfiguration', {
      method: 'POST',
      data: {
        styleName: options?.styleName,
        isExpert: options?.isExpert ?? false,
        menuSetting: options?.menuSetting,
      },
    });
  }

  async setAmbilightFollowVideoMode(mode: AmbilightFollowVideoMode) {
    try {
      const _mode = ambilightFollowVideoModeSchema.parse(mode);

      return this.setAmbilightCurrentConfiguration({
        styleName: 'FOLLOW_VIDEO',
        menuSetting: _mode,
      });
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }

  async setAmbilightFollowAudioMode(mode: AmbilightFollowAudioMode) {
    try {
      const _mode = ambilightFollowAudioModeSchema.parse(mode);

      return this.setAmbilightCurrentConfiguration({
        styleName: 'FOLLOW_AUDIO',
        menuSetting: _mode,
      });
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err : new Error(String(err)),
      };
    }
  }

  setAmbilightMode(mode: AmbilightModes) {
    try {
      const _mode = ambilightModesSchema.parse(mode);

      return this.digestClient.request('ambilight/mode', {
        method: 'POST',
        data: {
          current: _mode,
        },
      });
    } catch (err) {
      return Promise.resolve({
        success: false,
        error: err instanceof Error ? err : new Error(String(err)),
      });
    }
  }

  getAmbilightCached() {
    return this.digestClient.request('ambilight/cached');
  }

  getAmbiHue() {
    return this.digestClient.request('HueLamp/power');
  }

  getAmbilightConfiguration() {
    return this.digestClient.request('ambilight/currentconfiguration');
  }
}
