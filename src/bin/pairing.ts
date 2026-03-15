import { isIP } from 'node:net';
import { consola } from 'consola';
import pkgJson from '../../package.json';
import { PhilTVPairing } from '../lib/PhilTVPairing';

const processOn = ['SIGINT', 'SIGTERM', 'uncaughtException'];

for (const eventName of processOn) {
  process.on(eventName, () => {
    consola.info('OK. Bye.');
  });
}

const inIP = process.argv[2];

async function runPairing() {
  consola.box(`\nphiltv-js\nPairing TV\n${pkgJson.version}\n`.trim());

  const ipAddress = inIP ? inIP.trim() : await consola.prompt('Enter TV ip address:', { type: 'text' });

  if (!isIP(ipAddress)) {
    consola.error(`'${ipAddress}' is an invalid IP address. Bye.`);
    process.exit(1);
  }

  const pjs = new PhilTVPairing({ tvIp: ipAddress });

  consola.info(`Starting pairing with TV at ${pjs.apiUrls.secure}`);
  consola.start('Trying to contact TV...');

  const initRes = await pjs.init();

  if (!initRes.success || (initRes.data && !initRes.data.isReady)) {
    consola.error(`
      Check if the TV is on and the IP is correct.
      Only Philips TVs with API version 6 or higher are supported.
      Only secure transport and digest auth pairing are supported (https).\n
      ${!initRes.success ? initRes.error.message : ''}
      Bye.
      `);
    process.exit(1);
  }

  consola.success('TV is ready with API version', initRes.data.apiVersion);

  consola.start(`Trying to pair TV at ${pjs.pairingRequestUrl}...`);
  const startRes = await pjs.startPairing();

  if (!startRes.success) {
    consola.error(`
      Failed to start pairing.\n
      ${startRes.error.message}\n
      Bye.
      `);
    process.exit(1);
  }

  const promptForPin = async () =>
    await consola.prompt('Enter pin code from TV:', {
      type: 'text',
    });

  const pin = await promptForPin();

  const completeRes = await pjs.completePairing(pin as string);

  if (!completeRes.success) {
    consola.error(`${completeRes.error.message}\nBye.`);
  } else {
    consola.success('Pairing successful');
    consola.box(JSON.stringify(completeRes.data, null, 2));
  }
}

runPairing();
