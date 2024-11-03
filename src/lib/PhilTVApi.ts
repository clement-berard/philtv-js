import { tryit } from 'radash';
import type { InputKeys } from '../types/jointspace';
import { PhilTVApiBase } from './PhilTVApiBase';

export class PhilTVApi extends PhilTVApiBase {
  getSystem() {
    return tryit(this.digestClient.get('system').json)();
  }

  getAmbilight() {
    return tryit(this.digestClient.get('ambilight/currentconfiguration').json)();
  }

  async setAmbilightBrightness(brightness: number) {
    return this.handleSetMenuItemSetting('ambilight_brightness', brightness);
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
