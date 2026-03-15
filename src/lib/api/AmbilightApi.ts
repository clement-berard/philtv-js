import type { getHttpDigestClient } from '../../http-clients/http-digest-client';
import { ambilightFollowAudioModeSchema, ambilightFollowVideoModeSchema } from '../../schemas/jointspace.schema';
import type {
  AmbiHueState,
  AmbilightBrightnessChoices,
  AmbilightCurrentConfiguration,
  AmbilightFollowAudioMode,
  AmbilightFollowVideoMode,
  AmbilightMode,
  AmbilightModeResponse,
  AmbilightPixelData,
  MenuSettingValueInner,
  RGBColor,
} from '../../types';
import { handleAmbilightBrightness } from './ambilight/brightness';
import { type GetFullAmbilightInformationResult, handleGetFullInformation } from './ambilight/getFullInformation';
import { handleAmbilightMode } from './ambilight/mode';
import type { MenuApi } from './MenuApi';

/**
 * Provides methods to interact with the Ambilight API,
 * including brightness control, mode management, color configuration, and state retrieval.
 */
export class AmbilightApi {
  /** @internal */
  constructor(
    /** @internal */
    public readonly digestClient: ReturnType<typeof getHttpDigestClient>,
    private readonly menuApi: MenuApi,
  ) {}

  /**
   * Sets the Ambilight brightness to the given level.
   * @param brightness - The desired brightness level.
   */
  async setBrightness(brightness: AmbilightBrightnessChoices): Promise<void> {
    return handleAmbilightBrightness(this).setBrightness(this.menuApi, brightness);
  }

  /**
   * Retrieves full brightness information including available choices and current value.
   */
  async getBrightnessInformation(): Promise<MenuSettingValueInner> {
    return handleAmbilightBrightness(this).getBrightnessInformation(this.menuApi);
  }

  /**
   * Returns the current brightness value.
   */
  async getBrightnessValue(): Promise<number> {
    return handleAmbilightBrightness(this).getBrightnessValue();
  }

  /**
   * Increases the Ambilight brightness by one step.
   */
  async increaseBrightness(): Promise<void> {
    await handleAmbilightBrightness(this).increase();
  }

  /**
   * Decreases the Ambilight brightness by one step.
   */
  async decreaseBrightness(): Promise<void> {
    await handleAmbilightBrightness(this).decrease();
  }

  /**
   * Returns the current Ambilight mode.
   */
  async getMode(): Promise<AmbilightModeResponse> {
    return handleAmbilightMode(this).getMode();
  }

  /**
   * Sets the Ambilight mode.
   * @param mode - The Ambilight mode to apply.
   */
  async setMode(mode: AmbilightMode): Promise<void> {
    await handleAmbilightMode(this).setMode(mode);
  }

  /**
   * Retrieves full Ambilight information including mode, brightness, and configuration.
   */
  async getFullInformation(): Promise<GetFullAmbilightInformationResult> {
    return handleGetFullInformation(this);
  }

  /**
   * Posts a new current configuration to the Ambilight API.
   * @param options - The configuration options including style name and menu setting.
   * @protected
   */
  protected async setCurrentConfiguration(options: AmbilightCurrentConfiguration): Promise<void> {
    await this.digestClient.request('ambilight/currentconfiguration', {
      method: 'POST',
      data: {
        styleName: options.styleName,
        isExpert: false,
        menuSetting: options.menuSetting,
      },
    });
  }

  /**
   * Sets the Ambilight to Follow Video mode.
   * @param mode - The follow video mode to apply.
   * @throws If the provided mode fails schema validation.
   */
  async setFollowVideoMode(mode: AmbilightFollowVideoMode): Promise<void> {
    const _mode = ambilightFollowVideoModeSchema.parse(mode);

    await this.setCurrentConfiguration({
      styleName: 'FOLLOW_VIDEO',
      isExpert: false,
      menuSetting: _mode,
    });
  }

  /**
   * Sets the Ambilight to Follow Audio mode.
   * @param mode - The follow audio mode to apply.
   * @throws If the provided mode fails schema validation.
   */
  async setFollowAudioMode(mode: AmbilightFollowAudioMode): Promise<void> {
    const _mode = ambilightFollowAudioModeSchema.parse(mode);

    await this.setCurrentConfiguration({
      styleName: 'FOLLOW_AUDIO',
      isExpert: false,
      menuSetting: _mode,
    });
  }

  /**
   * Turns off the Ambilight.
   */
  async turnOff(): Promise<void> {
    await this.setCurrentConfiguration({
      styleName: 'OFF',
      isExpert: false,
    });
  }

  /**
   * Sets the Ambilight to a static color from a hex string.
   * @param hexColor - The target color as a hex string (e.g. `#FF8800`).
   * @param opt - Optional settings. If `brightness` is provided, it will be applied before setting the color.
   */
  async setStaticColor(hexColor: string, opt?: { brightness: AmbilightBrightnessChoices }): Promise<void> {
    const hex = hexColor.replace('#', '');
    const r = Number.parseInt(hex.substring(0, 2), 16);
    const g = Number.parseInt(hex.substring(2, 4), 16);
    const b = Number.parseInt(hex.substring(4, 6), 16);

    await this.setMode('manual');

    if (opt?.brightness) {
      await this.setBrightness(opt.brightness);
    }

    await this.setCachedColor({ r, g, b });
  }

  /**
   * Sends an RGB color to the Ambilight cached endpoint.
   * @param data - The RGB color to apply.
   * @throws If the request fails.
   */
  async setCachedColor(data: RGBColor): Promise<void> {
    const res = await this.digestClient.request('ambilight/cached', {
      method: 'POST',
      data,
    });

    if (!res.success) {
      throw res.error;
    }
  }

  /**
   * Retrieves the current cached Ambilight pixel state.
   * @returns The current pixel data.
   * @throws If the request fails.
   */
  async getCachedState(): Promise<AmbilightPixelData> {
    const res = await this.digestClient.request<AmbilightPixelData>('ambilight/cached');

    if (!res.success) {
      throw res.error;
    }

    return res.data;
  }

  /**
   * Returns the current AmbiHue (Philips Hue sync) power state.
   * @throws If the request fails.
   */
  async getAmbiHue(): Promise<AmbiHueState> {
    const res = await this.digestClient.request<AmbiHueState>('HueLamp/power');

    if (!res.success) {
      throw res.error;
    }

    return res.data;
  }

  /**
   * Retrieves the current Ambilight configuration from the API.
   * @throws If the request fails.
   */
  async getConfiguration(): Promise<AmbilightCurrentConfiguration> {
    const res = await this.digestClient.request<AmbilightCurrentConfiguration>('ambilight/currentconfiguration');

    if (!res.success) {
      throw res.error;
    }

    return res.data;
  }
}
