# API Usage - JointSpace API

The `PhilTVApi` class provides a clean, typed, and structured way to interact with your Philips TV. From controlling Ambilight to reading system information, the API is organized into dedicated modules to make integration straightforward and predictable.

::: warning Prerequisites
You must have the `user` and `password` values generated during the pairing process before using the JointSpace API. See the [Pairing](pairing.md) section for setup instructions.
:::

## Initialization

To start interacting with your TV, create an instance of the `PhilTVApi` class by passing your credentials via the [`PhilTVApiParams`](lib/TypeAlias.PhilTVApiParams.md) object.

```typescript
import { PhilTVApi } from 'philtv-js';

const tvClient = new PhilTVApi({
  apiUrl: 'https://192.168.0.22:1926/6',
  user: 'd1443b9fdeecd187277as5464564565e6315',
  password: '5bewertrewref6968be556667552a49da5bf5fce3b379127cf74af2a3951026c2b',
});
```

## Quick Examples

The client exposes categorized sub-APIs (like `ambilight`, `system`, `input`, and `menu`). Here are a few ways you can bring your integrations to life:

### 💡 Control Ambilight
Take full control over your Ambilight experience by changing modes, applying colors, or turning it off.

```typescript
// Set Ambilight to follow the video with a specific style
await tvClient.ambilight.setFollowVideoMode('Vivid');

// Apply a precise static color (e.g., Orange) with a specific brightness
await tvClient.ambilight.setStaticColor('#FF8800', { brightness: 8 });

// Turn off the Ambilight
await tvClient.ambilight.turnOff();
```

### 🎮 Simulate Remote Inputs
Navigate menus or control playback by simulating physical remote key presses.

```typescript
// Pause or resume playback
await tvClient.input.sendKey('PlayPause');

// Increase the volume
await tvClient.input.sendKey('VolumeUp');

// Put the TV in standby mode
await tvClient.input.sendKey('Standby');
```

### ⚙️ Read System Information
Fetch real-time data about your device and what is currently running.

```typescript
// Get the TV model and API version
const systemInfo = await tvClient.system.getSystem();
console.log(`TV Model: ${systemInfo.model}`);

// Check which application or activity is currently active
const currentApp = await tvClient.system.getCurrentActivity();
console.log(`Current Activity: ${currentApp.component.packageName}`);
```

## Next Steps

This library is fully typed to provide excellent autocomplete in your IDE. To explore all available methods, configurations, and advanced features, check out the full class documentation.

📚 **[Read the full PhilTVApi documentation](lib/Class.PhilTVApi.md)**
