import { PhilTVPairing } from './lib/pairing';

// @ts-ignore
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

const pjs = new PhilTVPairing({ tvIp: '10.0.0.19', apiPort: 1926 });
await pjs.init();
const { promptForPin } = await pjs.startPairing();
const pin = (await promptForPin()) as string;
const { config, error } = await pjs.completePairing(pin);

if (!error) {
  console.log('config', config);
} else {
  console.error('error', error.message);
}

// const jsClient = new PhilTVJointspace({
//   user: 'e853885b01bddece989052f4b4723405',
//   password: 'a782e70b5b2b26dc94329a638a4da6ca91f97cf5552c2fb8038d7d23cc0d4c4c',
//   apiUrl: 'https://10.0.0.19:1926/6',
// });
//
// const rr = await jsClient.getAmbilight();
// console.log('rr', rr);
