# Welcome to philtv-js

**philtv-js** is a modern, fully-typed TypeScript library designed to control Philips Android TVs using the **JointSpace v6** API protocol.

Whether you want to build a custom smart home integration, control your Ambilight programmatically, or build a complete alternative remote control, `philtv-js` provides a secure, predictable, and developer-friendly way to interact with your TV.

## Why use philtv-js? ✨

- **100% Type-Safe**: Built from the ground up with TypeScript. Catch errors at compile time and enjoy excellent IDE autocomplete for payloads, Ambilight colors, and remote keys.
- **Built-in Pairing**: Handles the complex Digest Auth pairing process out of the box, either programmatically or via a convenient CLI.
- **Modern & Lightweight**: Powered by [`urllib`](https://www.npmjs.com/package/urllib) (built on top of the native Fetch API) for fast, secure HTTP/HTTPS requests without bloated dependencies.
- **Domain Driven**: API surface is logically split into sub-modules (`ambilight`, `system`, `input`, `menu`) to keep your code clean.

::: warning Compatibility Notice
This library is specifically designed for modern Philips TVs running **API Version 6** over HTTPS using Digest Authentication. Older TVs running v1 or v5 over plain HTTP are not currently supported.
:::

## Installation 🧑‍💻

Add `philtv-js` to your project using your favorite package manager:

::: code-group
```bash [npm]
npm install philtv-js
```
```bash [pnpm]
pnpm add philtv-js
```
```bash [yarn]
yarn add philtv-js
```
:::

## Used by 💪

See how others are using `philtv-js` in the wild:

- [node-red-contrib-js-philips-tv-control](https://www.npmjs.com/package/@keload/node-red-contrib-js-philips-tv-control) – A Node-RED node to easily control Philips TVs directly from your flows.

*(Are you using this library? Open a PR to add your project here!)*

## Useful Resources & Inspiration 📚

This library stands on the shoulders of giants. A huge thanks to the developers who previously reverse-engineered and documented the JointSpace protocol.

**Official & Community Docs:**
- [JointSPACE API Reference Manual (PDF)](https://jointspace.sourceforge.net/projectdata/jointSPACE_API_Reference_Manual.pdf)
- [JointSPACE API v1 HTML Documentation](https://jointspace.sourceforge.net/projectdata/documentation/jasonApi/1/doc/API.html)
- [Comprehensive JointSpace Gist by marcelrv](https://gist.github.com/marcelrv/ee9a7cf97c227d069e4ee88d26691019)

**Other Implementations:**
- Python: [pylips](https://github.com/eslavnov/pylips) / [philips_android_tv](https://github.com/suborb/philips_android_tv/blob/master/philips.py) / [Home Assistant Custom Component](https://github.com/jomwells/ambilights/blob/master/custom_components/philips_ambilight/light.py)
- Node.js: [codes.lucasvdh.philips-jointspace](https://github.com/lucasvdh/codes.lucasvdh.philips-jointspace)

---

## Ready to start?
Jump to the **[Pairing Guide](./pairing.md)** to generate your credentials and start controlling your TV!
