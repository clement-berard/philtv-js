# Pairing TV

To use `philtv-js`, you need to import the PhilTVPairing class from the library:

```typescript
import { PhilTVPairing } from 'philtv-js';

// instantiate the class with the TV's IP address. Default port is 1926
const pjs = new PhilTVPairing({ tvIp: '192.168.0.22' });

// `startPairing` returns a function to prompt for the pin, can be useful
const { promptForPin } = await pjs.startPairing();
const pin = await promptForPin();

// `completePairing` returns the configuration object, or an error
const [error, config] = await pjs.completePairing(pin);

if (!error) {
  console.log('Pairing successful:', config);
} else {
  console.error('Error:', error.message);
}
```
Result example of `config`:
```json
{
  "user": "d1443b9fdeecd187277as5464564565e6315",
  "password": "5bewertrewref6968be556667552a49da5bf5fce3b379127cf74af2a3951026c2b",
  "apiUrl": "https://192.168.0.22:1926",
  "apiVersion": 6,
  "fullApiUrl": "https://192.168.0.22:1926/6"
}
```
You can store the `user` and `password` in a secure location and use them to interact with your TV.
