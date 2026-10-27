import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

/**
 * Device push registration for Firebase Cloud Messaging.
 *
 * The backend (Laravel + Firebase Admin) sends notifications to a raw FCM
 * registration token, so on Android `getDevicePushTokenAsync()` returns
 * exactly that token (google-services.json is bundled via app.json). On iOS
 * it returns the APNs token, which needs a separate Firebase iOS setup to be
 * useful — out of scope until a GoogleService-Info.plist is added.
 *
 * Every call is best-effort: it returns `null` on web, on a device without
 * Google Play services, when permission is refused, or on any error. The
 * caller must never let a missing token block sign-in.
 */
export async function getPushToken() {
  if (Platform.OS === 'web') return null;
  try {
    // Android 8+ needs a channel before any notification can be shown.
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('default', {
        name: 'Default',
        importance: Notifications.AndroidImportance.DEFAULT,
      });
    }

    // Ask once if we haven't already; the registration token is still
    // available even if the user declines to let notifications be shown.
    const current = await Notifications.getPermissionsAsync();
    if (!current.granted && current.canAskAgain !== false) {
      await Notifications.requestPermissionsAsync();
    }

    const { data } = await Notifications.getDevicePushTokenAsync();
    return typeof data === 'string' ? data : null;
  } catch {
    return null;
  }
}
