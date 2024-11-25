# Pairing TV

To use `philtv-js`, you need to import the PhilTVPairing class from the library:

## Programmatic way

You can find an example with the CLI [here](https://github.com/clement-berard/philtv-js/blob/main/src/bin/pairing.ts).

## CLI way

You can run 

```bash
npx philtv-js
```

All the methods return a config object that you can use to interact with your TV.

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
