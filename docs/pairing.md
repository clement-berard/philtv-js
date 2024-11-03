# Pairing TV

To use `philtv-js`, you need to import the PhilTVPairing class from the library:

```typescript
import { PhilTVPairing } from 'philtv-js';

// @ts-ignore
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; // Disable TLS certificate verification

const pjs = new PhilTVPairing({ tvIp: '192.168.0.22', apiPort: 1926 });

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

::: info
Usage of `NODE_TLS_REJECT_UNAUTHORIZED`:
Setting `NODE_TLS_REJECT_UNAUTHORIZED = 0` disables TLS certificate verification, which can expose your application to "man-in-the-middle" attacks. Use it with caution and only in development environments.

For more information on managing TLS certificates, refer to the Node.js documentation.
:::
