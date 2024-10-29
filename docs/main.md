# philtv-js

**philtv-js** is a TypeScript library for pairing a Philips Android TV with the latest versions (6) using the **JointSpace** protocol. This library simplifies the pairing process, allowing you to interact with your Philips television securely and efficiently. With full TypeScript support, `philtv-js` provides type safety, helping to prevent runtime errors and improve code quality.

This library leverages the lightweight [ky](https://github.com/sindresorhus/ky) HTTP client, which is built on top of Fetch API, for making secure and intuitive HTTP requests.

**Works only in secure environments (HTTPS) and with versions 6 of the JointSpace protocol.**

## Table of Contents

[[toc]]

## Installation

To install `philtv-js`, you can use npm:

```bash
npm install philtv-js
```
## Usage

### Pairing

To use philtv-js, you need to import the PhilTVPairing class from the library:

```typescript
import { PhilTVPairing } from 'philtv-js';

// @ts-ignore
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0; // Disable TLS certificate verification

const pjs = new PhilTVPairing({ tvIp: '192.168.0.22', apiPort: 1926 });

// you must to call init() before startPairing(), to check if the TV is reachable and compatible
await pjs.init();

// `startPairing` returns a function to prompt for the pin, can be useful
const { promptForPin } = await pjs.startPairing();
const pin = await promptForPin();

// `completePairing` returns the configuration object, or an error
const { config, error } = await pjs.completePairing(pin);

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
  "fullApiUrl": "https://10.0.0.19:1926/6"
}
```
You can store the `user` and `password` in a secure location and use them to interact with your TV.

::: info
Usage of `NODE_TLS_REJECT_UNAUTHORIZED`:
Setting `NODE_TLS_REJECT_UNAUTHORIZED = 0` disables TLS certificate verification, which can expose your application to "man-in-the-middle" attacks. Use it with caution and only in development environments.

For more information on managing TLS certificates, refer to the Node.js documentation.
:::

### JointSpace API

::: warning
You must have the `user` and `password` from the pairing process to use the JointSpace API. See the Pairing section for more information.
:::

```typescript
const apiClient = new PhilTVApi({
  apiUrl: 'https://10.0.0.19:1926/6',
  password: '5bewertrewref6968be556667552a49da5bf5fce3b379127cf74af2a3951026c2b',
  user: 'd1443b9fdeecd187277as5464564565e6315',
});
```

Please see the all available methods in the [API documentation](./lib/classes/PhilTVApi.md)
