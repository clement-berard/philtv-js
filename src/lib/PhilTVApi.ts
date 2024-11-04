import { tryit } from 'radash';
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
    return tryit(this.digestClient.get('system').json)();
  }

  getAmbilightConfiguration() {
    return tryit(this.digestClient.get('ambilight/currentconfiguration').json)();
  }

  async setAmbilightBrightness(brightness: number) {
    return this.handleSetMenuItemSetting('ambilight_brightness', {
      value: brightness,
    });
  }

  protected async setAmbilightCurrentConfiguration(options: Record<any, any>) {
    return tryit(this.digestClient.post)('ambilight/currentconfiguration', {
      json: {
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

  getAmbilightMode() {
    return tryit(this.digestClient.get('ambilight/mode').json)();
  }

  setAmbilightMode(mode: 'manual' | 'internal' | 'expert') {
    return this.digestClient.post('ambilight/mode', {
      json: {
        current: mode,
      },
    });
  }

  getAmbilightCached() {
    return tryit(this.digestClient.get('ambilight/cached').json)();
  }

  getSource() {
    return tryit(this.digestClient.get('sources/current').json)();
  }

  getChannels() {
    return tryit(this.digestClient.get('channeldb/tv/channelLists/all').json)();
  }

  getCurrentActivity() {
    return tryit(this.digestClient.get('activities/current').json)();
  }

  getApplications() {
    return tryit(this.digestClient.get('applications').json)();
  }

  sendKey(key: InputKeys) {
    return this.digestClient.post('input/key', {
      json: { key: key },
    });
  }

  getAmbiHue() {
    return tryit(this.digestClient.get('HueLamp/power').json)();
  }

  getCurrentSetting(nodeId: number) {
    return tryit(
      this.digestClient.post('menuitems/settings/current', {
        json: {
          nodes: [{ nodeid: nodeId }],
        },
      }).json,
    )();
  }
}
