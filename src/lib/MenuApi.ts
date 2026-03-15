import type { ApiResult, getHttpDigestClient } from '../http-clients/http-digest-client';
import type { FlatNodeType, MenuItemNode, MenuItemsSettingsResponse, MenuItemsSettingsUpdatePayload } from '../types';
import { getFlattenNodes } from '../utils';

function buildMenuItemData(type: FlatNodeType, value: unknown): unknown {
  switch (type) {
    case 'SLIDER_NODE':
      return { value: Number(value) };
    case 'TOGGLE_NODE':
      return { boolean_value: value ? 'true' : 'false' };
    case 'LIST_NODE':
      return typeof value === 'string' ? { string_id: value } : { enum_id: Number(value) };
    default:
      return value;
  }
}

export class MenuApi {
  /** @internal */
  constructor(private readonly digestClient: ReturnType<typeof getHttpDigestClient>) {}

  async getMenuStructure(opts = { flat: false }) {
    const res = await this.digestClient.request<any>('menuitems/settings/structure');

    if (!res.success) {
      return { success: false, error: res.error };
    }

    if (opts.flat) {
      return { success: true, data: getFlattenNodes(res.data.node) }; // node pas nodes
    }

    return { success: true, data: res.data };
  }

  async getMenuStructureItem(context?: string, nodeId?: number): Promise<ApiResult<MenuItemNode | undefined>> {
    const res = await this.getMenuStructure({ flat: true });

    if (!res.success) {
      return { success: false, error: res.error ?? new Error('Failed to fetch menu structure') };
    }

    const flatNodes = res.data as MenuItemNode[];
    const item = flatNodes.find((node) => (context ? node.context === context : node.node_id === nodeId));

    return { success: true, data: item };
  }

  async setMenuItemSetting(item: MenuItemNode | undefined, value: unknown): Promise<ApiResult<''>> {
    if (!item) {
      return { success: false, error: new Error('Item not found') };
    }

    const payload: MenuItemsSettingsUpdatePayload = {
      values: [
        {
          value: {
            Nodeid: item.node_id,
            Controllable: 'true',
            Available: 'true',
            data: buildMenuItemData(item.type as FlatNodeType, value),
          },
        },
      ],
    };

    const res = await this.digestClient.request('menuitems/settings/update', {
      method: 'POST',
      data: payload,
    });

    if (!res.success) {
      return { success: false, error: res.error };
    }

    return { success: true, data: '' };
  }
}
