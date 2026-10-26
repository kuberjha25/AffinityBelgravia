import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

/** Keeps the Sanctum token between launches (Keychain / Keystore; localStorage on web). */
const TOKEN_KEY = 'affinity.authToken';

const web = Platform.OS === 'web';

export async function loadToken() {
  try {
    if (web) return globalThis.localStorage?.getItem(TOKEN_KEY) || null;
    return await SecureStore.getItemAsync(TOKEN_KEY);
  } catch {
    return null;
  }
}

export async function saveToken(token) {
  try {
    if (web) globalThis.localStorage?.setItem(TOKEN_KEY, token);
    else await SecureStore.setItemAsync(TOKEN_KEY, token);
  } catch {
    // Not fatal: the user just has to log in again next launch.
  }
}

export async function clearToken() {
  try {
    if (web) globalThis.localStorage?.removeItem(TOKEN_KEY);
    else await SecureStore.deleteItemAsync(TOKEN_KEY);
  } catch {
    // ignore
  }
}
