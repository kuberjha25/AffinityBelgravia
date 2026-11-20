import { Platform } from 'react-native';
import Notifications from './notificationsModule'; // null when the native module is missing (Expo Go)

/**
 * Device push for Firebase Cloud Messaging (via expo-notifications — the app
 * has no @react-native-firebase; expo-notifications runs the FCM service).
 *
 * The backend (Laravel + Firebase Admin) sends notifications to a raw FCM
 * registration token, so on Android `getDevicePushTokenAsync()` returns
 * exactly that token (google-services.json is bundled via app.json). On iOS
 * it returns the APNs token, which needs a separate Firebase iOS setup to be
 * useful — out of scope until a GoogleService-Info.plist is added.
 *
 * Foreground behaviour: there is no in-app popup. When a push arrives while
 * the app is open (FCM `onMessage`), it is re-posted as a local notification
 * so it lands in the phone's notification bar like any system notification.
 * Taps are routed in src/notificationTaps.js.
 */

export const ANDROID_CHANNEL_ID = 'default';

/** Marks the local copy we post for a foreground push, so it isn't re-posted. */
const LOCAL_ECHO_KEY = '_foregroundEcho';

const isRemote = (notification) => notification?.request?.trigger?.type === 'push';

let channelReady = null;
/** Android 8+ needs a channel before any notification can be shown. */
function ensureChannel() {
  if (Platform.OS !== 'android' || !Notifications) return Promise.resolve();
  if (!channelReady) {
    channelReady = Notifications.setNotificationChannelAsync(ANDROID_CHANNEL_ID, {
      name: 'Default',
      importance: Notifications.AndroidImportance.HIGH,
    }).catch(() => {
      channelReady = null;
    });
  }
  return channelReady;
}

/**
 * Title / body of a push. Notification messages carry them in `content`;
 * data-only messages usually put them in `data` (`title`, `body`/`message`).
 */
function pushContent(notification) {
  const content = notification?.request?.content || {};
  const data = content.data && typeof content.data === 'object' ? content.data : {};
  return {
    title: content.title || data.title || 'Affinity Belgravia',
    body: content.body || data.body || data.message || '',
    data,
  };
}

/** FCM onMessage equivalent: posts a received foreground push to the notification bar. */
async function postForegroundPush(notification) {
  if (!isRemote(notification)) return; // our own local echo, or a scheduled local notification
  const { title, body, data } = pushContent(notification);
  if (data[LOCAL_ECHO_KEY]) return;
  try {
    await ensureChannel();
    await Notifications.scheduleNotificationAsync({
      content: { title, body, data: { ...data, [LOCAL_ECHO_KEY]: true }, sound: 'default' },
      trigger: Platform.OS === 'android' ? { channelId: ANDROID_CHANNEL_ID } : null,
    });
  } catch (e) {
    if (__DEV__) console.log('⚠️  Could not post foreground notification:', e?.message || e);
  }
}

let installed = false;
/**
 * Call once at startup (App.js). `onReceived(notification)` runs for every
 * foreground push — used to refresh the notification list / bell badge.
 */
export function installForegroundNotifications(onReceived) {
  if (installed || !Notifications) return;
  installed = true;
  ensureChannel();

  Notifications.setNotificationHandler({
    // The raw push is not shown by expo (we post our own copy below, which is).
    handleNotification: async (notification) => {
      const show = !isRemote(notification);
      return { shouldShowBanner: show, shouldShowList: show, shouldPlaySound: show, shouldSetBadge: false };
    },
  });

  Notifications.addNotificationReceivedListener((notification) => {
    if (!isRemote(notification)) return;
    postForegroundPush(notification);
    try {
      onReceived?.(notification);
    } catch {
      // never let a listener break delivery
    }
  });
}

let lastLoggedToken = null;
/** Prints the FCM token on its own line so it can be copied from the Metro terminal. */
function logToken(token) {
  if (token === lastLoggedToken) return;
  lastLoggedToken = token;
  const line = '='.repeat(72);
  console.log(`\n${line}\n🔔 FCM TOKEN (${Platform.OS}) — paste into Firebase console › Messaging › Send test message\n${line}\n${token}\n${line}\n`);
}

/**
 * Every call is best-effort: it returns `null` on web, on a device without
 * Google Play services, when permission is refused, or on any error. The
 * caller must never let a missing token block sign-in.
 */
export async function getPushToken() {
  if (!Notifications) return null;
  try {
    await ensureChannel();

    // Ask once if we haven't already; the registration token is still
    // available even if the user declines to let notifications be shown.
    const current = await Notifications.getPermissionsAsync();
    if (!current.granted && current.canAskAgain !== false) {
      await Notifications.requestPermissionsAsync();
    }

    const { data } = await Notifications.getDevicePushTokenAsync();
    const token = typeof data === 'string' ? data : null;
    if (token) logToken(token);
    return token;
  } catch (e) {
    console.log(`⚠️  FCM token unavailable: ${e?.message || e}`);
    return null;
  }
}
