import type { KyInstance } from 'ky';
import { get, tryit } from 'radash';
import { createStorage } from 'unstorage';
import fsLiteDriver from 'unstorage/drivers/fs-lite';
import { createKyDigestClient } from '../http-clients';
import type { FlatNode, PhilTVApiParams } from '../types';
import { getFlattenNodes } from '../utils';

function getStorage(storagePath: string) {
  return createStorage({
    driver: fsLiteDriver({ base: `./.lib-cache/${storagePath}` }),
  });
}

/**
 * Class representing the base API for interacting with Philips TV.
 */
export class PhilTVApiBase {
  protected digestClient: KyInstance;
  protected instanceOptions: PhilTVApiParams['options'];

  constructor(params: PhilTVApiParams) {
    this.digestClient = createKyDigestClient(params.apiUrl, params.user, params.password);
    this.instanceOptions = params.options;
  }

  /**
   * Gets the digest client instance.
   *
   * @returns The digest client instance used for API requests.
   */
  getDigestClient() {
    return this.digestClient;
  }

  /**
   * Retrieves the menu structure from the Philips TV API.
   *
   * @param opts - Options for the request.
   * @param opts.flat - Whether to return the flattened structure. Default is false.
   * @returns A promise that resolves to a tuple of error (if any) and the menu structure.
   */
  async getMenuStructure(opts: { flat?: boolean } = { flat: false }) {
    const cacheStructure = get<boolean | undefined>(this.instanceOptions, 'cacheStructure');
    const storage = getStorage('');
    if (cacheStructure) {
      const existentCache = await storage.getItem('tv-structure:flat');
      if (existentCache) {
        return [undefined, existentCache];
      }
    }

    const [errorRaw, rawStructure] = await tryit<any[], any>(
      this.digestClient.get('menuitems/settings/structure').json,
    )();

    if (errorRaw) {
      return [errorRaw, undefined];
    }

    if (opts.flat) {
      const flatStructure = getFlattenNodes(rawStructure.node);
      if (cacheStructure) {
        await storage.set('tv-structure:flat', flatStructure);
      }

      return [undefined, flatStructure];
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

  protected async handleSetMenuItemSetting(contextName: string, value: unknown) {
    const [errorGetStructureItem, item] = await this.getMenuStructureItems(contextName);
    const [errorSetMenuItemSetting, result] = await this.setMenuItemSetting(item, value);

    return [errorGetStructureItem || errorSetMenuItemSetting, result] as const;
  }
}
