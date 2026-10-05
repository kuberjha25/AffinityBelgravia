import React from 'react';
import { View, Text, Pressable, StyleSheet, Platform } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon from '../components/Icon';
import { colors, spacing, type, borderWidth } from '../theme';

import HomeScreen from '../screens/HomeScreen';
import LeadsScreen from '../screens/LeadsScreen';
import SiteVisitsScreen from '../screens/SiteVisitsScreen';
import NewsScreen from '../screens/NewsScreen';
import MyProfileScreen from '../screens/MyProfileScreen';

const Tab = createBottomTabNavigator();

const ICONS = {
  Home: 'home',
  Leads: 'users',
  Visits: 'calendar',
  News: 'newspaper',
  Profile: 'user',
};

/** Figma component: "Navigation / Tab Bar". */
function TabBar({ state, descriptors, navigation }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {state.routes.map((route, index) => {
        const focused = state.index === index;
        const { options } = descriptors[route.key];
        const label = options.tabBarLabel ?? route.name;

        const onPress = () => {
          const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
          if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
        };

        return (
          <Pressable key={route.key} onPress={onPress} style={s.item} accessibilityRole="button">
            <Icon
              name={ICONS[route.name]}
              size={22}
              color={focused ? colors.brandPrimary : colors.muted}
            />
            <Text style={[s.label, focused && { color: colors.brandPrimary }]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export function StackTabBar({ navigation, activeRoute = 'Home' }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.bar, { paddingBottom: Math.max(insets.bottom, spacing.sm) }]}>
      {Object.entries(ICONS).map(([name, icon]) => {
        const focused = activeRoute === name;
        return (
          <Pressable
            key={name}
            onPress={() => navigation.navigate('Main', { screen: name })}
            style={s.item}
            accessibilityRole="button"
            accessibilityState={{ selected: focused }}
          >
            <Icon name={icon} size={22} color={focused ? colors.brandPrimary : colors.muted} />
            <Text style={[s.label, focused && { color: colors.brandPrimary }]}>{name}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export default function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false }}
      tabBar={(props) => <TabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Leads" component={LeadsScreen} />
      <Tab.Screen name="Visits" component={SiteVisitsScreen} />
      <Tab.Screen name="News" component={NewsScreen} />
      <Tab.Screen name="Profile" component={MyProfileScreen} />
    </Tab.Navigator>
  );
}

const s = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.glassFill,
    borderTopWidth: borderWidth.default,
    borderTopColor: colors.border,
    paddingTop: spacing.md,
    ...Platform.select({
      ios: { shadowColor: '#1c1b19', shadowOffset: { width: 0, height: -2 }, shadowOpacity: 0.04, shadowRadius: 12 },
      android: { elevation: 12 },
    }),
  },
  item: { flex: 1, alignItems: 'center', gap: 4 },
  label: { ...type.caption, color: colors.muted },
});
