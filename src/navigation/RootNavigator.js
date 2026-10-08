import React from 'react';
import { View } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator, { StackTabBar } from './TabNavigator';

import SplashScreen from '../screens/SplashScreen';
import LoginScreen from '../screens/LoginScreen';
import OtpScreen from '../screens/OtpScreen';
import CompleteProfileScreen from '../screens/CompleteProfileScreen';
import ProfileStepTwoScreen from '../screens/ProfileStepTwoScreen';
import ChannelPartnerDetailsScreen from '../screens/ChannelPartnerDetailsScreen';
import ThankYouScreen from '../screens/ThankYouScreen';

import HomeScreen from '../screens/HomeScreen';
import RegistrationsScreen from '../screens/RegistrationsScreen';
import RegistrationDetailScreen from '../screens/RegistrationDetailScreen';
import VisitDetailScreen from '../screens/VisitDetailScreen';
import ScheduleVisitScreen from '../screens/ScheduleVisitScreen';
import MISReportScreen from '../screens/MISReportScreen';
import ProjectsScreen from '../screens/ProjectsScreen';
import ProjectDetailScreen from '../screens/ProjectDetailScreen';
import InventoryScreen from '../screens/InventoryScreen';
import DocumentsScreen from '../screens/DocumentsScreen';
import LeadDetailScreen from '../screens/LeadDetailScreen';
import NewLeadScreen from '../screens/NewLeadScreen';
import NewsDetailScreen from '../screens/NewsDetailScreen';
import NotificationsScreen from '../screens/NotificationsScreen';
import TermsScreen from '../screens/TermsScreen';
import AboutScreen from '../screens/AboutScreen';
import GreetingsScreen from '../screens/GreetingsScreen';

const Stack = createNativeStackNavigator();

function withMainTabBar(Component) {
  return function ScreenWithMainTabBar(props) {
    return (
      <View style={{ flex: 1 }}>
        <Component {...props} />
        <StackTabBar navigation={props.navigation} />
      </View>
    );
  };
}

const RegistrationsWithTabBar = withMainTabBar(RegistrationsScreen);
const MISReportWithTabBar = withMainTabBar(MISReportScreen);
const ProjectsWithTabBar = withMainTabBar(ProjectsScreen);
const ProjectDetailWithTabBar = withMainTabBar(ProjectDetailScreen);
const InventoryWithTabBar = withMainTabBar(InventoryScreen);
const DocumentsWithTabBar = withMainTabBar(DocumentsScreen);

export default function RootNavigator() {
  return (
    <Stack.Navigator
      initialRouteName="Splash"
      screenOptions={{ headerShown: false, animation: 'slide_from_right' }}
    >
      {/* Onboarding */}
      <Stack.Screen name="Splash" component={SplashScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Login" component={LoginScreen} options={{ animation: 'fade' }} />
      <Stack.Screen name="Otp" component={OtpScreen} />
      <Stack.Screen name="CompleteProfile" component={CompleteProfileScreen} />
      <Stack.Screen name="ProfileStepTwo" component={ProfileStepTwoScreen} />
      <Stack.Screen name="ChannelPartnerDetails" component={ChannelPartnerDetailsScreen} />
      <Stack.Screen name="ThankYou" component={ThankYouScreen} options={{ animation: 'fade' }} />

      {/* Main app */}
      <Stack.Screen name="Main" component={TabNavigator} options={{ animation: 'fade' }} />

      {/* Pushed screens */}
      <Stack.Screen
        name="UserHome"
        component={HomeScreen}
        initialParams={{ variant: 'user' }}
      />
      <Stack.Screen name="Registrations" component={RegistrationsWithTabBar} />
      <Stack.Screen name="RegistrationDetail" component={RegistrationDetailScreen} />
      <Stack.Screen name="VisitDetail" component={VisitDetailScreen} />
      <Stack.Screen name="ScheduleVisit" component={ScheduleVisitScreen} />
      <Stack.Screen name="MISReport" component={MISReportWithTabBar} />
      <Stack.Screen name="Projects" component={ProjectsWithTabBar} />
      <Stack.Screen name="ProjectDetail" component={ProjectDetailWithTabBar} />
      <Stack.Screen name="Inventory" component={InventoryWithTabBar} />
      <Stack.Screen name="Documents" component={DocumentsWithTabBar} />
      <Stack.Screen name="LeadDetail" component={LeadDetailScreen} />
      <Stack.Screen name="NewLead" component={NewLeadScreen} />
      <Stack.Screen name="NewsDetail" component={NewsDetailScreen} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} />
      <Stack.Screen name="Terms" component={TermsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
      <Stack.Screen name="Greetings" component={GreetingsScreen} />
    </Stack.Navigator>
  );
}
