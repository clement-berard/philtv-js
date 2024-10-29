import type { KyInstance } from 'ky';
import { tryit } from 'radash';
import { createKyDigestClient } from '../http-clients';
import type { FlatNode, PhilTVApiParams } from '../types';
import type { InputKeys } from '../types/jointspace';
import { getFlattenNodes } from '../utils';

export class PhilTVApi {
  private readonly digestClient: KyInstance;

  constructor(params: PhilTVApiParams) {
    this.digestClient = createKyDigestClient(params.apiUrl, params.user, params.password);
  }

  getDigestClient() {
    return this.digestClient;
  }

  getSystem() {
    return tryit(this.digestClient.get('system').json)();
  }

  async getMenuStructure(opts: { flat?: boolean } = { flat: false }) {
    const [errorRaw, rawStructure] = await tryit<any[], any>(
      this.digestClient.get('menuitems/settings/structure').json,
    )();
    if (errorRaw) {
      return [errorRaw, undefined];
    }

    if (opts.flat) {
      return [undefined, getFlattenNodes(rawStructure.node)];
    }

    return [undefined, rawStructure];
  }

  async getMenuStructureItems(context: string) {
    const [errorFlatten, flattenStructure] = await this.getMenuStructure({ flat: true });

    if (!errorFlatten) {
      return [
        undefined,
        flattenStructure.find((node: any) => {
          return String(node?.context).toLowerCase() === context;
        }),
      ] as [undefined, FlatNode];
    }
    return [errorFlatten, undefined] as [Error, undefined];
  }

  getAmbilight() {
    return tryit(this.digestClient.get('ambilight/currentconfiguration').json)();
  }

  setMenuItemSetting(item: FlatNode | undefined, value: any) {
    if (!item) {
      return [new Error('Item not found'), undefined] as const;
    }

    const req = this.digestClient
      .post('menuitems/settings/update', {
        json: {
          values: [
            {
              value: {
                Nodeid: item.node_id,
                data: {
                  value: value,
                },
              },
            },
          ],
        },
      })
      .then((resp) => {
        return {
          status: resp.status,
          statusText: resp.statusText,
          body: resp.body,
          item,
        };
      });

    return tryit(() => req)();
  }

  private async handleSetMenuItemSetting(contextName: string, value: unknown) {
    const [errorGetStructureItem, item] = await this.getMenuStructureItems(contextName);
    const [errorSetBrightness, result] = await this.setMenuItemSetting(item, value);

    return [errorGetStructureItem || errorSetBrightness, result] as const;
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
    // todo: enum for keys
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
