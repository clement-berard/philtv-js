import type { ApiResult, getHttpDigestClient } from '../http-clients/http-digest-client';
import type { FlatNode } from '../types';
import { getFlattenNodes } from '../utils';

export class MenuApi {
  constructor(private readonly digestClient: ReturnType<typeof getHttpDigestClient>) {}

  async getMenuStructure(opts = { flat: false }): Promise<ApiResult<unknown>> {
    const res = await this.digestClient.request<Record<string, unknown>>('menuitems/settings/structure');

    if (!res.success) {
      return { success: false, error: res.error };
    }

    if (opts.flat) {
      return { success: true, data: getFlattenNodes(res.data.node) };
    }

    return { success: true, data: res.data };
  }

  async getMenuStructureItem(context?: string, nodeId?: number): Promise<ApiResult<FlatNode | undefined>> {
    const res = await this.getMenuStructure({ flat: true });

    if (!res.success) {
      return { success: false, error: res.error ?? new Error('Failed to fetch menu structure') };
    }

    const flattenStructure = res.data as FlatNode[];
    const toFilterTerm = context ? 'context' : 'node_id';
    const toFilterValue = context || nodeId;

    const item = flattenStructure.find((node: unknown) => {
      return (node as Record<string, unknown>)?.[toFilterTerm] === toFilterValue;
    }) as FlatNode | undefined;

    return { success: true, data: item };
  }

  async setMenuItemSetting(item: FlatNode | undefined, value: unknown): Promise<ApiResult<unknown>> {
    if (!item) {
      return { success: false, error: new Error('Item not found') };
    }

    const res = await this.digestClient.request('menuitems/settings/update', {
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

    if (!res.success) {
      return { success: false, error: res.error };
    }

    return { success: true, data: { data: res.data, item } };
  }

  public async handleSetMenuItemSetting(contextName: string, value: unknown): Promise<ApiResult<unknown>> {
    const res = await this.getMenuStructureItem(contextName);

    if (!res.success) {
      return { success: false, error: res.error ?? new Error('Failed to fetch menu structure item') };
    }

    return this.setMenuItemSetting(res.data, value);
  }
}
