import type { getHttpDigestClient } from '../../http-clients/http-digest-client';
import type {
  FlatNodeType,
  MenuItemNode,
  MenuItemsCurrentResponseNode,
  MenuItemsSettingsRequest,
  MenuItemsSettingsUpdatePayload,
  MenuSettingValue,
} from '../../types';
import { getFlattenNodes } from '../../utils/node.utils';

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

/**
 * Provides methods to interact with the Menu API,
 * including menu structure retrieval, item lookup, and setting updates.
 */
export class MenuApi {
  /** @internal */
  constructor(private readonly digestClient: ReturnType<typeof getHttpDigestClient>) {}

  /**
   * Retrieves the full menu structure from the device.
   * @param opts - Options object. If `flat` is `true`, returns a flattened array of nodes instead of the raw tree.
   * @throws If the request fails.
   */
  async getMenuStructure(opts = { flat: false }) {
    const res = await this.digestClient.request<any>('menuitems/settings/structure');

    if (!res.success) {
      throw res.error;
    }

    if (opts.flat) {
      return getFlattenNodes(res.data.node);
    }

    return res.data;
  }

  /**
   * Finds a single menu item node by context string or node ID.
   * @param context - The context string to match against. Takes priority over `nodeId` if provided.
   * @param nodeId - The node ID to match against, used when `context` is not provided.
   * @returns The matching {@link MenuItemNode}.
   * @throws If no matching item is found or the structure request fails.
   */
  async getMenuStructureItem(context?: string, nodeId?: number): Promise<MenuItemNode> {
    const res = await this.getMenuStructure({ flat: true });

    const flatNodes = res as MenuItemNode[];

    const found = flatNodes.find((node) => (context ? node.context === context : node.node_id === nodeId));

    if (!found) {
      throw new Error('Menu Item not found');
    }

    return found;
  }

  /**
   * Updates the setting value of a given menu item node.
   * @param item - The menu item node to update. Throws if `undefined`.
   * @param value - The new value to apply. Automatically formatted based on the node type (`SLIDER_NODE`, `TOGGLE_NODE`, `LIST_NODE`).
   * @throws If the item is undefined or the request fails.
   */
  async setMenuItemSetting(item: MenuItemNode | undefined, value: unknown): Promise<void> {
    if (!item) {
      throw new Error('Item not found');
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
      throw res.error;
    }
  }

  /**
   * Retrieves the current setting values for a given node ID.
   * @param nodeId - The ID of the node to query.
   * @returns The list of current setting values for the node.
   * @throws If the request fails.
   */
  async getCurrentSetting(nodeId: number): Promise<MenuSettingValue[]> {
    const res = await this.digestClient.request<MenuItemsCurrentResponseNode>('menuitems/settings/current', {
      method: 'POST',
      data: { nodes: [{ nodeid: nodeId }] } satisfies MenuItemsSettingsRequest,
    });

    if (!res.success) {
      throw new Error('getCurrentSetting');
    }

    return res.data.values;
  }
}
