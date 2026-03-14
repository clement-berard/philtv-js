import { get } from 'radash';
import {
  ambilightBrightnessChoicesSchema,
  ambilightFollowAudioModeSchema,
  ambilightFollowVideoModeSchema,
  ambilightModesSchema,
  inputKeysSchema,
} from '../schemas/jointspace.schema';
import type {
  AmbilightBrightnessChoices,
  AmbilightFollowAudioMode,
  AmbilightFollowVideoMode,
  AmbilightModes,
  InputKeys,
} from '../types';
import { PhilTVApiBase } from './PhilTVApiBase';

export class PhilTVApi extends PhilTVApiBase {
  async getSystem() {
    const [err, data] = await this.digestClient.request('system');

    if (err) {
      return this.renderResponse(err, undefined);
    }

    return [
      undefined,
      {
        ...data,
        fullApiVersion: `${data.api_version.Major}.${data.api_version.Minor}.${data.api_version.Patch}`,
      },
    ] as const;
  }

  async setAmbilightBrightness(brightness: AmbilightBrightnessChoices) {
    const { error: errValidation } = ambilightBrightnessChoicesSchema.safeParse(brightness);

    if (errValidation) {
      return this.renderResponse(errValidation, undefined);
    }

    return this.handleSetMenuItemSetting('ambilight_brightness', {
      value: Number(brightness),
    });
  }

  async increaseAmbilightBrightness() {
    const [, currentBrightness] = await this.getAmbilightBrightnessValue();

    const computedBrightness = Number(currentBrightness) + 1;
    const realBrightness = Math.min(10, Math.max(0, computedBrightness)) as AmbilightBrightnessChoices;

    return this.setAmbilightBrightness(realBrightness);
  }

  async decreaseAmbilightBrightness() {
    const [, currentBrightness] = await this.getAmbilightBrightnessValue();

    const computedBrightness = Number(currentBrightness) - 1;
    const realBrightness = Math.min(10, Math.max(0, computedBrightness)) as AmbilightBrightnessChoices;

    return this.setAmbilightBrightness(realBrightness);
  }

  getAmbilightConfiguration() {
    return this.digestClient.request('ambilight/currentconfiguration');
  }

  async getAmbilightBrightnessInformation() {
    const [errorGetStructureItem, item] = await this.getMenuStructureItemByContext('ambilight_brightness');

    if (errorGetStructureItem) {
      return this.renderResponse(errorGetStructureItem, undefined);
    }

    const nodeId = item?.node_id;
    const [errCurrentSetting, values] = await this.getCurrentSetting(nodeId);

    if (errCurrentSetting) {
      return this.renderResponse(errCurrentSetting, undefined);
    }

    return [undefined, get(values, '0.value', undefined)] as const;
  }

  async getAmbilightBrightnessValue() {
    const [err, info] = await this.getAmbilightBrightnessInformation();

    return [err, Number(get(info, 'data.value', undefined))] as const;
  }

  getAmbilightMode() {
    return this.digestClient.request('ambilight/mode');
  }

  async getAmbilightFullInformation() {
    const [
      getAmbilightConfiguration,
      getAmbilightBrightnessInformation,
      getAmbilightMode,
      getAmbilightCached,
      getAmbiHue,
    ] = await Promise.all([
      this.getAmbilightConfiguration(),
      this.getAmbilightBrightnessInformation(),
      this.getAmbilightMode(),
      this.getAmbilightCached(),
      this.getAmbiHue(),
    ]);

    const [err1, ambilightConfiguration] = getAmbilightConfiguration;
    const [err2, ambilightBrightnessInformation] = getAmbilightBrightnessInformation;
    const [err3, ambilightMode] = getAmbilightMode;
    const [err4, ambilightCached] = getAmbilightCached;
    const [err5, ambiHue] = getAmbiHue;

    const result = {
      configuration: ambilightConfiguration,
      mode: ambilightMode,
      brightness: ambilightBrightnessInformation,
      cached: ambilightCached,
      ambiHue,
    };

    return [err1 || err2 || err3 || err4 || err5, result] as const;
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
    const validator = ambilightFollowVideoModeSchema.safeParse(mode);

    if (validator.error) {
      return this.renderResponse(validator.error, undefined);
    }

    return this.setAmbilightCurrentConfiguration({
      styleName: 'FOLLOW_VIDEO',
      menuSetting: mode,
    });
  }

  async setAmbilightFollowAudioMode(mode: AmbilightFollowAudioMode) {
    const validator = ambilightFollowAudioModeSchema.safeParse(mode);

    if (validator.error) {
      return this.renderResponse(validator.error, undefined);
    }

    return this.setAmbilightCurrentConfiguration({
      styleName: 'FOLLOW_AUDIO',
      menuSetting: mode,
    });
  }

  setAmbilightMode(mode: AmbilightModes) {
    const { error: errValidation } = ambilightModesSchema.safeParse(mode);

    if (errValidation) {
      return this.renderResponse(errValidation, undefined);
    }

    return this.digestClient.request('ambilight/mode', {
      method: 'POST',
      data: {
        current: mode,
      },
    });
  }

  getAmbilightCached() {
    return this.digestClient.request('ambilight/cached');
  }

  getCurrentActivity() {
    return this.digestClient.request('activities/current');
  }

  getApplications() {
    return this.digestClient.request('applications');
  }

  sendKey(key: InputKeys) {
    const { error: errValidation } = inputKeysSchema.safeParse(key);

    if (errValidation) {
      return this.renderResponse(errValidation, undefined);
    }

    return this.digestClient.request('input/key', {
      method: 'POST',
      data: {
        key: key,
      },
    });
  }

  getAmbiHue() {
    return this.digestClient.request('HueLamp/power');
  }

  async getCurrentSetting(nodeId: number) {
    const [, node] = await this.digestClient.request('menuitems/settings/current', {
      method: 'POST',
      data: { nodes: [{ nodeid: nodeId }] },
    });

    const values = node?.values as any[];
    const hasValues = values?.length > 0;

    if (hasValues) {
      return [undefined, values] as const;
    }

    return [new Error('menuitems/settings/current: No values'), undefined] as const;
  }
}
