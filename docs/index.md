---
# https://vitepress.dev/reference/default-theme-home-page
layout: home

hero:
  name: "philtv-js"
  text: "The modern Node.js client for Philips TVs"
  tagline: Control your Philips Android TV securely using the JointSpace API v6. Fully typed, zero friction.
  actions:
    - theme: brand
      text: Get Started
      link: /get-started.md
    - theme: alt
      text: GitHub Repository
      link: https://github.com/clement-berard/philtv-js

features:
  - title: Total Ambilight Control
    details: Take full command of your lights. Easily set static hex colors, sync with audio/video, change modes, or adjust brightness programmatically.
    icon:
      src: https://www.svgrepo.com/show/421766/bulb-electric-energy.svg
  - title: 100% Type-Safe
    details: Written from the ground up in TypeScript. Enjoy exhaustive autocompletion for endpoints, payloads, and API methods directly in your IDE.
    icon:
      src: https://upload.wikimedia.org/wikipedia/commons/4/4c/Typescript_logo_2020.svg
  - title: Modern & Secure
    details: Powered by urllib. Built-in support for Digest Authentication over HTTPS to securely pair and communicate with modern TVs.
    icon:
      src: https://github.com/sindresorhus/ky/raw/main/media/logo.svg
---
