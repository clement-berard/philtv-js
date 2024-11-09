import { getHttpDigestClient } from '../http-clients';
import type { FlatNode, PhilTVApiParams } from '../types';
import { getFlattenNodes } from '../utils';

/**
 * Class representing the base API for interacting with Philips TV.
 */
export class PhilTVApiBase {
  protected digestClient: ReturnType<typeof getHttpDigestClient>;

  constructor(params: PhilTVApiParams) {
    this.digestClient = getHttpDigestClient({
      user: params.user,
      password: params.password,
      baseUrl: params.apiUrl,
    });
  }

  /**
   * Gets the digest client instance.
   *
   * @returns The digest client instance used for API requests.
   */
  getDigestClient() {
    return this.digestClient;
  }

  protected renderResponse(error: Error | undefined, body: unknown | undefined) {
    return [error, body] as const;
  }

  async getMenuStructure(opts: { flat?: boolean } = { flat: false }) {
    const [errorRaw, data, resp] = await this.digestClient.request('menuitems/settings/structure');

    if (errorRaw) {
      return [errorRaw, undefined];
    }

    if (opts.flat) {
      const flatStructure = getFlattenNodes(data.node);

      return [undefined, flatStructure, resp];
    }

    return [undefined, data, resp];
  }

  async getMenuStructureItem(context: string | undefined, nodeId: number | undefined) {
    const [errorFlatten, flattenStructure] = await this.getMenuStructure({ flat: true });

    const toFilterTerm = context ? 'context' : 'node_id';
    const toFilterValue = context || nodeId;

    if (!errorFlatten) {
      return [
        undefined,
        flattenStructure.find((node: any) => {
          return node?.[toFilterTerm] === toFilterValue;
        }),
      ] as [undefined, FlatNode];
    }
    return [errorFlatten, undefined] as [Error, undefined];
  }

  async getMenuStructureItemByContext(context: string) {
    return this.getMenuStructureItem(context, undefined);
  }

  async getMenuStructureItemByNodeId(nodeId: number) {
    return this.getMenuStructureItem(undefined, nodeId);
  }

  async setMenuItemSetting(item: FlatNode | undefined, value: any) {
    if (!item) {
      return [new Error('Item not found'), undefined] as const;
    }

    const [err, data, resp] = await this.digestClient.request('menuitems/settings/update', {
      method: 'POST',
      data: {
        values: [
          {
            value: {
              Nodeid: item.node_id,
              data: value,
            },
          },
        ],
      },
    });

    const result = {
      status: resp.status,
      statusText: resp.statusText,
      body: data,
      item,
      originalResponse: resp,
    };

    return [err, result] as const;
  }

  protected async handleSetMenuItemSetting(contextName: string, value: unknown) {
    const [errorGetStructureItem, item] = await this.getMenuStructureItemByContext(contextName);
    const [errorSetMenuItemSetting, result] = await this.setMenuItemSetting(item, value);

    return [errorGetStructureItem || errorSetMenuItemSetting, result] as const;
  }
}
