import { describe, expect, it } from 'vitest';
import { getFlattenNodes } from '../node.utils';

describe('node.utils', () => {
  describe('getFlattenNodes', () => {
    it('should return an array with a single node if no children exist', () => {
      const input = {
        node_id: 1,
        type: 'ROOT',
        string_id: 'root-string',
        context: 'root-context',
        data: { someValue: 42 },
      };

      const result = getFlattenNodes(input);

      expect(result).toHaveLength(1);
      expect(result[0]).toEqual({
        node_id: 1,
        type: 'ROOT',
        string_id: 'root-string',
        context: 'root-context',
        data: { someValue: 42 },
      });
    });

    it('should recursively flatten nested nodes and omit "nodes" array from the data payload', () => {
      const input = {
        node_id: 1,
        type: 'ROOT',
        data: {
          nodes: [
            {
              node_id: 2,
              type: 'CHILD',
              data: { childValue: 'a' },
            },
            {
              node_id: 3,
              type: 'CHILD',
              data: {
                nodes: [{ node_id: 4, type: 'GRANDCHILD', data: {} }],
              },
            },
          ],
        },
      };

      const result = getFlattenNodes(input);

      expect(result).toHaveLength(4);

      const nodeIds = result.map((n) => n.node_id);
      expect(nodeIds).toEqual([1, 2, 3, 4]);

      const rootNode = result.find((n) => n.node_id === 1);
      expect(rootNode?.data).not.toHaveProperty('nodes');

      const node3 = result.find((n) => n.node_id === 3);
      expect(node3?.data).not.toHaveProperty('nodes');
    });

    it('should handle nodes with empty or undefined data gracefully', () => {
      const input = { node_id: 99, type: 'EMPTY' };
      const result = getFlattenNodes(input);

      expect(result).toHaveLength(1);
      expect(result[0].node_id).toBe(99);
      expect(result[0].data).toEqual({});
    });
  });
});
