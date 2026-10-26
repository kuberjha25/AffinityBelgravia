import { createNavigationContainerRef, CommonActions } from '@react-navigation/native';

/** Lets non-screen code (the session-expiry handler) move to a route. */
export const navigationRef = createNavigationContainerRef();

export function resetTo(name, params) {
  if (!navigationRef.isReady()) return;
  navigationRef.dispatch(CommonActions.reset({ index: 0, routes: [{ name, params }] }));
}
