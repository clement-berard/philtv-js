# API Usage - JointSpace API

::: warning
You must have the `user` and `password` from the pairing process to use the JointSpace API. See the [Pairing](pairing.md) section for more information.
:::

To create an instance of the `PhilTVApi` class, you need to provide an object of type [`PhilTVApiParams`](./lib/type-aliases/PhilTVApiParams.md) as a parameter to the constructor.

```typescript
const apiClient = new PhilTVApi({
  apiUrl: 'https://192.168.0.22:1926/6',
  password: '5bewertrewref6968be556667552a49da5bf5fce3b379127cf74af2a3951026c2b',
  user: 'd1443b9fdeecd187277as5464564565e6315',
});
```

Please see the all available methods in the [API documentation](./lib/classes/PhilTVApi.md)
