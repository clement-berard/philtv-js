import type { ApiResult, getHttpDigestClient } from '../http-clients/http-digest-client';
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

/** @internal */
export interface MenuSettingValue {
  value?: unknown;
  data?: {
    value?: string | number;
  };
}

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

  /**
   * Sets the Ambilight brightness to the given value.
   *
   * @param brightness - The target brightness level to apply.
   * @returns A result object indicating success or failure.
   */
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

  /**
   * Retrieves the current setting values for a given menu node.
   *
   * @param nodeId - The node ID of the menu item to query.
   * @returns A result object containing the setting values, or an error if none are found.
   */
  async getCurrentSetting(nodeId: number): Promise<ApiResult> {
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

  /**
   * Retrieves the full menu setting information for the Ambilight brightness item.
   *
   * @returns A result object containing the raw setting value, or `undefined` if the node is not found.
   */
  async getAmbilightBrightnessInformation(): Promise<ApiResult> {
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

    // @ts-expect-error
    return { success: true, data: valuesRes.data?.[0]?.value };
  }

  /**
   * Retrieves the current Ambilight brightness as a numeric value.
   *
   * @returns A result object containing the brightness level as a number.
   */
  async getAmbilightBrightnessValue(): Promise<ApiResult<number>> {
    const infoRes = await this.getAmbilightBrightnessInformation();

    if (!infoRes.success) {
      return infoRes;
    }

    const info = infoRes.data as MenuSettingValue | undefined;
    const rawValue = info?.data?.value ?? 0;

    return { success: true, data: Number(rawValue) };
  }

  /**
   * Increases the current Ambilight brightness by 1, capped at the maximum value of 10.
   *
   * @returns A result object from {@link setAmbilightBrightness}.
   */
  async increaseAmbilightBrightness(): Promise<ApiResult> {
    const currentRes = await this.getAmbilightBrightnessValue();

    if (!currentRes.success) {
      return currentRes;
    }

    const computedBrightness = Number(currentRes.data) + 1;
    const realBrightness = Math.min(10, Math.max(0, computedBrightness)) as AmbilightBrightnessChoices;

    return this.setAmbilightBrightness(realBrightness);
  }

  /**
   * Decreases the current Ambilight brightness by 1, floored at the minimum value of 0.
   *
   * @returns A result object from {@link setAmbilightBrightness}.
   */
  async decreaseAmbilightBrightness() {
    const currentRes = await this.getAmbilightBrightnessValue();

    if (!currentRes.success) {
      return currentRes;
    }

    const computedBrightness = Number(currentRes.data) - 1;
    const realBrightness = Math.min(10, Math.max(0, computedBrightness)) as AmbilightBrightnessChoices;

    return this.setAmbilightBrightness(realBrightness);
  }

  /**
   * Retrieves the current Ambilight mode.
   *
   * @returns A result object containing the current mode data.
   */
  getAmbilightMode() {
    return this.digestClient.request('ambilight/mode');
  }

  /**
   * Retrieves all Ambilight-related information in a single parallel call.
   * Aggregates configuration, brightness, mode, cached state, and AmbiHue status.
   *
   * @returns A result object containing all Ambilight context data.
   */
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

  /**
   * Sends a configuration update to the current Ambilight style.
   *
   * @param options - Configuration options including `styleName`, `menuSetting`, and optionally `isExpert`.
   * @returns A result object from the underlying request.
   */
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

  /**
   * Sets the Ambilight mode to `FOLLOW_VIDEO` with the specified sub-mode.
   *
   * @param mode - The follow-video mode to apply.
   * @returns A result object indicating success or failure.
   */
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

  /**
   * Sets the Ambilight mode to `FOLLOW_AUDIO` with the specified sub-mode.
   *
   * @param mode - The follow-audio mode to apply.
   * @returns A result object indicating success or failure.
   */
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

  /**
   * Sets the global Ambilight mode (e.g. `INTERNAL`, `MANUAL`, `OFF`).
   *
   * @param mode - The mode to activate.
   * @returns A result object indicating success or failure.
   */
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

  /**
   * Retrieves the cached Ambilight color data.
   *
   * @returns A result object containing the cached state.
   */
  getAmbilightCached() {
    return this.digestClient.request('ambilight/cached');
  }

  /**
   * Retrieves the power state of the AmbiHue (Hue Lamp) integration.
   *
   * @returns A result object containing the AmbiHue power status.
   */
  getAmbiHue() {
    return this.digestClient.request('HueLamp/power');
  }

  /**
   * Retrieves the current Ambilight configuration (style and settings).
   *
   * @returns A result object containing the current configuration.
   */
  getAmbilightConfiguration() {
    return this.digestClient.request('ambilight/currentconfiguration');
  }
}
