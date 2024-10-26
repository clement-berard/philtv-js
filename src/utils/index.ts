import { createHmac } from 'node:crypto';
import { stdin as input, stdout as output } from 'node:process';
import readline from 'node:readline/promises';

export function createSignature(secretKey: Buffer, secret: string) {
  const hmac = createHmac('sha1', secretKey);
  hmac.write(secret);
  hmac.end();
  // @ts-ignore
  return hmac.read('binary').toString('base64');
}

export async function promptText(question: string): Promise<string> {
  const rl = readline.createInterface({ input, output });
  const answer = await rl.question(`${question}: `);
  rl.close();
  return answer;
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
