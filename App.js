import React, { useCallback, useEffect, useState } from 'react';
import { View } from 'react-native';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import * as SplashScreen from 'expo-splash-screen';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

import RootNavigator from './src/navigation/RootNavigator';
import { AppProvider } from './src/store';
import { colors } from './src/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

/** Deep links — also what the web build uses for its URLs. */
const linking = {
  prefixes: ['affinitybelgravia://'],
  config: {
    screens: {
      Splash: '',
      Login: 'login',
      Otp: 'otp',
      CompleteProfile: 'profile/step-1',
      ProfileStepTwo: 'profile/step-2',
      ChannelPartnerDetails: 'profile/step-3',
      ThankYou: 'thank-you',
      Main: {
        path: 'app',
        screens: {
          Home: 'home',
          Leads: 'leads',
          Visits: 'visits',
          News: 'news',
          Profile: 'profile',
        },
      },
      UserHome: 'user-home',
      Registrations: 'registrations',
      RegistrationDetail: 'registrations/:id',
      VisitDetail: 'visits/:id',
      ScheduleVisit: 'visits/schedule',
      MISReport: 'mis-report',
      ProjectDetail: 'project',
      Inventory: 'inventory',
      Documents: 'documents',
      LeadDetail: 'leads/:id',
      NewLead: 'leads/new',
      NewsDetail: 'news/:id',
      Notifications: 'notifications',
      Terms: 'terms',
      About: 'about',
    },
  },
};

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: colors.surface,
    card: colors.surfaceSecondary,
    text: colors.onSurface,
    border: colors.border,
    primary: colors.brandPrimary,
  },
};

export default function App() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        await Font.loadAsync({
          'ElectroluxSans-Thin': require('./assets/fonts/ElectroluxSans-Thin.otf'),
          'ElectroluxSans-Light': require('./assets/fonts/ElectroluxSans-Light.otf'),
          'ElectroluxSans-Regular': require('./assets/fonts/ElectroluxSans-Regular.otf'),
          'ElectroluxSans-Semibold': require('./assets/fonts/ElectroluxSans-Semibold.otf'),
          'ElectroluxSans-Bold': require('./assets/fonts/ElectroluxSans-Bold.otf'),
          'ElectroluxSans-Italic': require('./assets/fonts/ElectroluxSans-Italic.otf'),
        });
      } catch (e) {
        console.warn('Font load failed, falling back to system font', e);
      } finally {
        setReady(true);
      }
    })();
  }, []);

  const onLayout = useCallback(async () => {
    if (ready) await SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  if (!ready) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }} onLayout={onLayout}>
      <KeyboardProvider>
      <SafeAreaProvider>
        <AppProvider>
          <StatusBar style="dark" />
          <NavigationContainer theme={navTheme} linking={linking}>
            <RootNavigator />
          </NavigationContainer>
        </AppProvider>
      </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
