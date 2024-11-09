import { get } from 'radash';
import { z } from 'zod';
import {
  type AmbilightFollowAudioMode,
  AmbilightFollowAudioModeEnum,
  type AmbilightFollowVideoMode,
  AmbilightFollowVideoModeEnum,
  type InputKeys,
} from '../types/jointspace';
import { PhilTVApiBase } from './PhilTVApiBase';

export class PhilTVApi extends PhilTVApiBase {
  getSystem() {
    return this.digestClient.request('system');
  }

  async setAmbilightBrightness(brightness: number) {
    return this.handleSetMenuItemSetting('ambilight_brightness', {
      value: brightness,
    });
  }

  async changeAmbilightBrightness(move: 'increase' | 'decrease') {
    const [, currentBrightness] = await this.getAmbilightBrightnessInformation();

    const computedBrightness = move === 'increase' ? Number(currentBrightness) + 1 : Number(currentBrightness) - 1;
    const realBrightness = Math.min(10, Math.max(0, computedBrightness));

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
    const [getAmbilightConfiguration, getAmbilightBrightnessInformation, getAmbilightMode] = await Promise.all([
      this.getAmbilightConfiguration(),
      this.getAmbilightBrightnessInformation(),
      this.getAmbilightMode(),
    ]);

    const [err1, ambilightConfiguration] = getAmbilightConfiguration;
    const [err2, ambilightBrightnessInformation] = getAmbilightBrightnessInformation;
    const [err3, ambilightMode] = getAmbilightMode;

    const result = {
      configuration: ambilightConfiguration,
      mode: ambilightMode,
      brightness: ambilightBrightnessInformation,
    };

    return [err1 || err2 || err3, result] as const;
  }

  protected async setAmbilightCurrentConfiguration(options: Record<any, any>) {
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
    const validator = z.enum(AmbilightFollowVideoModeEnum).safeParse(mode);

    if (validator.error) {
      return this.renderResponse(validator.error, undefined);
    }

    return this.setAmbilightCurrentConfiguration({
      styleName: 'FOLLOW_VIDEO',
      menuSetting: mode,
    });
  }

  async setAmbilightFollowAudioMode(mode: AmbilightFollowAudioMode) {
    const validator = z.enum(AmbilightFollowAudioModeEnum).safeParse(mode);

    if (validator.error) {
      return this.renderResponse(validator.error, undefined);
    }

    return this.setAmbilightCurrentConfiguration({
      styleName: 'FOLLOW_AUDIO',
      menuSetting: mode,
    });
  }

  setAmbilightMode(mode: 'manual' | 'internal' | 'expert') {
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
