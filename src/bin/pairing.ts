import { consola } from 'consola';
import { isIP } from 'is-ip';
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
  consola.box(
    `
philtv-js
Pairing TV
${pkgJson.version}
`.trim(),
  );

  let ipAddress: string;

  if (!inIP) {
    const promptForIp = async () =>
      await consola.prompt('Enter TV ip address:', {
        type: 'text',
      });

    ipAddress = await promptForIp();
  } else {
    ipAddress = inIP.trim();
  }

  if (!isIP(ipAddress)) {
    consola.error(`'${ipAddress}' is an invalid IP address. Bye.`);
    process.exit(1);
  }

  const pjs = new PhilTVPairing({ tvIp: ipAddress });

  consola.info(`Starting pairing with TV at ${pjs.apiUrls.secure}`);
  consola.start('Trying to contact TV...');

  const [errInit, dataInit] = await pjs.init();

  if (errInit || (dataInit && !dataInit.isReady)) {
    consola.error(`
      Check if the TV is on and the IP is correct.
      Only Philips TVs with API version 6 or higher are supported.
      Only secure transport and digest auth pairing are supported (https).\n

      ${errInit ? errInit?.message : ''}

      Bye.
      `);
    process.exit(1);
  }

  consola.success('TV is ready with API version', dataInit?.apiVersion);

  consola.start(`Trying to pair TV at ${pjs.pairingRequestUrl}...`);
  // `startPairing` returns a function to prompt for the pin, can be useful
  const { promptForPin } = await pjs.startPairing();
  const pin = await promptForPin();

  // `completePairing` returns the configuration object, or an error
  const [error, config] = await pjs.completePairing(pin);

  if (!error) {
    consola.success('Pairing successful');
    consola.box(JSON.stringify(config, null, 2));
  } else {
    consola.error(`${error.message}\nBye.`);
  }
}

runPairing();
