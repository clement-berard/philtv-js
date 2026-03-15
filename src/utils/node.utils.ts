import { omit } from 'radash';
import type { MenuItemNode } from '../types';

export function getFlattenNodes(allInput: any): MenuItemNode[] {
  const result: MenuItemNode[] = [];

  function flattenNodes(node: any) {
    const { node_id, type, string_id, context, data } = node;
    result.push({ node_id, type, string_id, context, data: omit(data, ['nodes']) });

    if (data?.nodes) {
      for (const childNode of data.nodes) {
        flattenNodes(childNode);
      }
    }
  }

  flattenNodes(allInput);
  return result;
}
