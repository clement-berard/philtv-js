import { beforeEach, describe, expect, it, vi } from 'vitest';
import * as nodeUtilsModule from '../../../utils/node.utils';
import { MenuApi } from '../MenuApi';

vi.mock('../../utils/node.utils');

describe('MenuApi', () => {
  let menuApi: MenuApi;
  let mockDigestClient: any;

  beforeEach(() => {
    mockDigestClient = {
      request: vi.fn(),
    };
    menuApi = new MenuApi(mockDigestClient);
    vi.clearAllMocks();
  });

  describe('getMenuStructure', () => {
    it('should return raw data when flat is false', async () => {
      const mockData = { node: { id: 1, type: 'ROOT' } };
      mockDigestClient.request.mockResolvedValue({
        success: true,
        data: mockData,
      });

      const result = await menuApi.getMenuStructure();

      expect(mockDigestClient.request).toHaveBeenCalledWith('menuitems/settings/structure');
      expect(result).toEqual(mockData);
    });

    it('should return flattened data when flat is true', async () => {
      const mockData = { node: { id: 1, type: 'ROOT' } };
      const flatResult = [{ node_id: 1 }];

      mockDigestClient.request.mockResolvedValue({
        success: true,
        data: mockData,
      });
      vi.spyOn(nodeUtilsModule, 'getFlattenNodes').mockReturnValue(flatResult as any);

      const result = await menuApi.getMenuStructure({ flat: true });

      expect(nodeUtilsModule.getFlattenNodes).toHaveBeenCalledWith(mockData.node);
      expect(result).toEqual(flatResult);
    });

    it('should throw error if request fails', async () => {
      mockDigestClient.request.mockResolvedValue({
        success: false,
        error: new Error('Network error'),
      });

      await expect(menuApi.getMenuStructure()).rejects.toThrow('Network error');
    });
  });

  describe('getMenuStructureItem', () => {
    it('should find item by context', async () => {
      const flatNodes = [
        { node_id: 1, context: 'other-context' },
        { node_id: 2, context: 'target-context' },
      ];

      vi.spyOn(menuApi, 'getMenuStructure').mockResolvedValue(flatNodes as any);

      const result = await menuApi.getMenuStructureItem('target-context');

      expect(result).toEqual({ node_id: 2, context: 'target-context' });
    });

    it('should find item by nodeId when context is not provided', async () => {
      const flatNodes = [
        { node_id: 1, context: 'other' },
        { node_id: 2, context: 'target' },
      ];

      vi.spyOn(menuApi, 'getMenuStructure').mockResolvedValue(flatNodes as any);

      const result = await menuApi.getMenuStructureItem(undefined, 2);

      expect(result).toEqual({ node_id: 2, context: 'target' });
    });

    it('should throw an error if item is not found', async () => {
      vi.spyOn(menuApi, 'getMenuStructure').mockResolvedValue([] as any);

      await expect(menuApi.getMenuStructureItem('missing')).rejects.toThrow('Menu Item not found');
    });
  });

  describe('setMenuItemSetting', () => {
    it('should throw if item is undefined', async () => {
      await expect(menuApi.setMenuItemSetting(undefined, 'value')).rejects.toThrow('Item not found');
    });

    it('should build SLIDER_NODE payload and send request', async () => {
      mockDigestClient.request.mockResolvedValue({ success: true });
      const item = { node_id: 10, type: 'SLIDER_NODE' } as any;

      await menuApi.setMenuItemSetting(item, '50');

      expect(mockDigestClient.request).toHaveBeenCalledWith('menuitems/settings/update', {
        method: 'POST',
        data: {
          values: [
            {
              value: {
                Nodeid: 10,
                Controllable: 'true',
                Available: 'true',
                data: { value: 50 },
              },
            },
          ],
        },
      });
    });

    it('should build TOGGLE_NODE payload and send request', async () => {
      mockDigestClient.request.mockResolvedValue({ success: true });
      const item = { node_id: 11, type: 'TOGGLE_NODE' } as any;

      await menuApi.setMenuItemSetting(item, true);

      expect(mockDigestClient.request).toHaveBeenCalledWith(
        'menuitems/settings/update',
        expect.objectContaining({
          data: expect.objectContaining({
            values: [{ value: expect.objectContaining({ data: { boolean_value: 'true' } }) }],
          }),
        }),
      );
    });

    it('should build LIST_NODE payload with string_id', async () => {
      mockDigestClient.request.mockResolvedValue({ success: true });
      const item = { node_id: 12, type: 'LIST_NODE' } as any;

      await menuApi.setMenuItemSetting(item, 'list_val');

      expect(mockDigestClient.request).toHaveBeenCalledWith(
        'menuitems/settings/update',
        expect.objectContaining({
          data: expect.objectContaining({
            values: [{ value: expect.objectContaining({ data: { string_id: 'list_val' } }) }],
          }),
        }),
      );
    });

    it('should build LIST_NODE payload with enum_id if value is a number', async () => {
      mockDigestClient.request.mockResolvedValue({ success: true });
      const item = { node_id: 12, type: 'LIST_NODE' } as any;

      await menuApi.setMenuItemSetting(item, 42);

      expect(mockDigestClient.request).toHaveBeenCalledWith(
        'menuitems/settings/update',
        expect.objectContaining({
          data: expect.objectContaining({
            values: [{ value: expect.objectContaining({ data: { enum_id: 42 } }) }],
          }),
        }),
      );
    });

    it('should throw if the update request fails', async () => {
      mockDigestClient.request.mockResolvedValue({ success: false, error: new Error('Update failed') });
      const item = { node_id: 10, type: 'SLIDER_NODE' } as any;

      await expect(menuApi.setMenuItemSetting(item, 50)).rejects.toThrow('Update failed');
    });
  });

  describe('getCurrentSetting', () => {
    it('should return settings values on success', async () => {
      mockDigestClient.request.mockResolvedValue({
        success: true,
        data: { values: [{ value: { data: 'test' } }] },
      });

      const result = await menuApi.getCurrentSetting(123);

      expect(mockDigestClient.request).toHaveBeenCalledWith('menuitems/settings/current', {
        method: 'POST',
        data: { nodes: [{ nodeid: 123 }] },
      });
      expect(result).toEqual([{ value: { data: 'test' } }]);
    });

    it('should throw getCurrentSetting if request fails', async () => {
      mockDigestClient.request.mockResolvedValue({
        success: false,
        error: new Error('Internal error'),
      });

      await expect(menuApi.getCurrentSetting(123)).rejects.toThrow('getCurrentSetting');
    });
  });
});
