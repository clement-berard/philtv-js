# Pairing TV

Before using `PhilTVApi`, you need to pair your application with the TV to obtain a `user` and a `password`. This only needs to be done once for each TV. After that, you can store the credentials securely and reuse them for future requests.

::: warning Prerequisites
Make sure your TV is powered on and connected to the same local network as the machine running your code.
:::

## CLI

For the quickest setup, you can use the built-in CLI:

```bash
npx philtv-js
```

Once the pairing is completed, the CLI returns a configuration object similar to this:

```json
{
  "user": "d1443b9fdeecd187277as5464564565e6315",
  "password": "5bewertrewref6968be556667552a49da5bf5fce3b379127cf74af2a3951026c2b",
  "apiUrl": "https://192.168.0.22:1926",
  "apiVersion": 6,
  "fullApiUrl": "https://192.168.0.22:1926/6"
}
```

You can then use these values to create a `PhilTVApi` instance.

## Programmatic pairing

If you want to handle pairing inside your own application, you can use `PhilTVPairing` directly. The process is simple:

1. Create a pairing client with the TV IP address.
2. Initialize the session.
3. Start pairing to display the PIN on the TV.
4. Ask the user to enter the PIN.
5. Complete pairing and store the returned credentials.

### Complete example

```ts
import { PhilTVPairing } from 'philtv-js';
import { createInterface } from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';

async function main() {
  const tvIp = '192.168.0.22';
  const pairing = new PhilTVPairing({ tvIp });

  await pairing.init();

  const startResult = await pairing.startPairing();

  if (!startResult.success) {
    throw startResult.error;
  }

  const rl = createInterface({ input, output });

  const pin = await rl.question('Enter the PIN displayed on the TV: ');
  rl.close();

  const completeResult = await pairing.completePairing(pin);

  if (!completeResult.success) {
    throw completeResult.error;
  }

  console.log('Pairing completed successfully.');
  console.log({
    user: completeResult.data.user,
    password: completeResult.data.password,
  });
}

main().catch((error) => {
  console.error('Pairing failed:', error);
});
```

## Store the credentials

After a successful pairing, save the returned credentials in a secure place such as environment variables, a local config file, or a secrets manager.

## Next step

Once you have the `user` and `password`, continue with the [API Usage](./api-usage.md) guide to create a `PhilTVApi` client and start controlling the TV.
