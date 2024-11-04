import { createHmac } from 'node:crypto';
import { omit } from 'radash';
import type { FlatNode } from '../types';

export function createSignature(secretKey: Buffer, secret: string) {
  const hmac = createHmac('sha1', secretKey);
  hmac.write(secret);
  hmac.end();
  // @ts-ignore
  return hmac.read('binary').toString('base64');
}

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
