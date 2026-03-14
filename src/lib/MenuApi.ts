import type { ApiResult, getHttpDigestClient } from '../http-clients/http-digest-client';
import type { FlatNode } from '../types';
import { getFlattenNodes } from '../utils';

/**
 * Provides methods to navigate and update the menu settings structure.
 */
export class MenuApi {
  /** @internal */
  constructor(private readonly digestClient: ReturnType<typeof getHttpDigestClient>) {}

  /**
   * Retrieves the full menu settings structure.
   *
   * @param opts - Options object. Si `flat` est `true`, retourne la structure aplatie sous forme de `FlatNode[]`.
   * @returns A result object containing either the raw structure or a flat list of nodes.
   */
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

  /**
   * Finds a single menu item in the flattened structure, by context name or node ID.
   * If both are provided, `context` takes priority.
   *
   * @param context - The context string to match against.
   * @param nodeId - The node ID to match against (used only if `context` is not provided).
   * @returns A result object containing the matching `FlatNode`, or `undefined` if not found.
   */
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

  /**
   * Sends an update request for a specific menu item setting.
   *
   * @param item - The `FlatNode` representing the menu item to update. Returns an error if `undefined`.
   * @param value - The new value to apply to the setting.
   * @returns A result object containing the API response and the updated item.
   */
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

  /**
   * Convenience method that resolves a menu item by context name and applies a new value to it.
   * Combines {@link getMenuStructureItem} and {@link setMenuItemSetting}
   *
   * @param contextName - The context string identifying the menu item.
   * @param value - The new value to apply.
   * @returns A result object indicating success or failure.
   */
  public async handleSetMenuItemSetting(contextName: string, value: unknown): Promise<ApiResult<unknown>> {
    const res = await this.getMenuStructureItem(contextName);

    if (!res.success) {
      return { success: false, error: res.error ?? new Error('Failed to fetch menu structure item') };
    }

    return this.setMenuItemSetting(res.data, value);
  }
}
