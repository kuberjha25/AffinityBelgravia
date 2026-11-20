import Notifications from './notificationsModule'; // null when the native module is missing (Expo Go)
import { store } from './store';
import { navigationRef, resetTo } from './navigation/navigationRef';
import { fetchNotifications } from './store/slices/notificationsSlice';
import { installForegroundNotifications } from './push';

/**
 * What happens when a notification is tapped — the same for every type:
 * - signed in  → the Notifications screen
 * - signed out → the Login screen only (nothing is remembered for after login)
 *
 * Works whether the app was killed (cold start), in the background, or open:
 * - cold start: SplashScreen awaits `checkLaunchNotification()`, then calls
 *   `consumePendingTap()` once the session is restored and routes from there;
 * - background / open: the response listener routes straight away.
 */

let pendingTap = false;
const handled = new Set();
let launchCheck = null;

const currentRouteName = () => (navigationRef.isReady() ? navigationRef.getCurrentRoute()?.name : null);

/** Splash still owns the first navigation: let it route the tap after bootstrap. */
const splashPending = () => !store.getState().auth.bootstrapped || !navigationRef.isReady() || currentRouteName() === 'Splash';

/** First time we see this response? (cold start can deliver it twice: last-response + listener). */
function firstSighting(response) {
  const key = `${response?.notification?.request?.identifier}|${response?.notification?.date}|${response?.actionIdentifier}`;
  if (handled.has(key)) return false;
  handled.add(key);
  return true;
}

function routeTap() {
  if (splashPending()) {
    pendingTap = true;
    return;
  }
  if (store.getState().auth.token) {
    store.dispatch(fetchNotifications());
    if (currentRouteName() !== 'Notifications') navigationRef.navigate('Notifications');
  } else if (currentRouteName() !== 'Login') {
    resetTo('Login');
  }
}

function onResponse(response) {
  if (!response || !firstSighting(response)) return;
  Notifications.clearLastNotificationResponseAsync().catch(() => {});
  routeTap();
}

/** Picks up the tap that launched a killed app. Resolves once known; never rejects. */
export function checkLaunchNotification() {
  if (!Notifications) return Promise.resolve();
  if (!launchCheck) {
    launchCheck = Notifications.getLastNotificationResponseAsync()
      .then((response) => {
        if (response && firstSighting(response)) {
          pendingTap = true;
          Notifications.clearLastNotificationResponseAsync().catch(() => {});
        }
      })
      .catch(() => {});
  }
  return launchCheck;
}

/** For SplashScreen: true (once) if a notification tap is waiting to be routed. */
export function consumePendingTap() {
  const tap = pendingTap;
  pendingTap = false;
  return tap;
}

let installed = false;
/** Call once at startup, before the navigator mounts. */
export function installNotificationHandling() {
  if (installed || !Notifications) return;
  installed = true;

  // Foreground push → system notification bar; also refresh the bell badge.
  installForegroundNotifications(() => {
    if (store.getState().auth.token) store.dispatch(fetchNotifications());
  });

  Notifications.addNotificationResponseReceivedListener(onResponse);
  checkLaunchNotification();
}
