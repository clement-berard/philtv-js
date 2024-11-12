import { consola } from 'consola';
// @ts-ignore
import figlet from 'figlet';
import { PhilTVPairing } from '../lib/PhilTVPairing';

async function runPairing() {
  figlet('philtv-js', (err: any, data: any) => {
    if (err) {
      console.log('Something went wrong...');
      console.dir(err);
      return;
    }
    console.log(data);
  });

  const promptForIp = async () =>
    await consola.prompt('Enter TV ip address:', {
      type: 'text',
    });

  const ipAddress = await promptForIp();

  console.log('promptForIp', ipAddress);

  const pjs = new PhilTVPairing({ tvIp: ipAddress });

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
