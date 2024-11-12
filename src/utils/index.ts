import { omit } from 'radash';
import { getHttpClient } from '../http-clients';
import type { FlatNode } from '../types';

export function getDeviceObject(deviceId: string) {
  return {
    app_id: 'gapp.id',
    id: deviceId,
    device_name: 'MyName',
    device_os: 'Android',
    app_name: 'PhilTV-js APP',
    type: 'native',
  };
}

export function getFlattenNodes(allInput: any) {
  const result: FlatNode[] = [];

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

export async function checkUrl(url: string) {
  const client = getHttpClient();
  try {
    await client.request(url, { method: 'GET', timeout: 1000 });

    return true;
  } catch (e) {
    return false;
  }
}
