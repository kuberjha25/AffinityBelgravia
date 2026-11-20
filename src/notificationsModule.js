import { Platform } from 'react-native';

/**
 * `expo-notifications`, loaded defensively. On Android it requires native
 * modules (e.g. `ExpoTopicSubscriptionModule`) at import time; inside Expo Go
 * or an app binary built before the module was added, that import throws
 * "Cannot find native module …" and would crash the whole app at launch.
 * Here it resolves to `null` instead, and push is simply unavailable —
 * use a development build (`npx expo run:android`) to get push.
 */
let Notifications = null;
if (Platform.OS !== 'web') {
  try {
    Notifications = require('expo-notifications');
  } catch (e) {
    console.log(
      `⚠️  Push disabled — expo-notifications native module missing (${e?.message || e}). ` +
        'Run a development build (npx expo run:android) instead of Expo Go / an old build.',
    );
  }
}

export default Notifications;
