import { createHmac } from 'node:crypto';

export function createSignature(secretKey: Buffer, secret: string) {
  const hmac = createHmac('sha1', secretKey);
  hmac.write(secret);
  hmac.end();
  // @ts-ignore
  return hmac.read('binary').toString('base64');
}
