import React from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import {
  Avatar,
  Card,
  Divider,
  KeyValue,
  PrimaryButton,
  StatusPill,
} from '../components/ui';
import { colors, spacing, type } from '../theme';
import { useApp } from '../store';

const PERSONAL_ICONS = {
  Phone: 'phone',
  Email: 'mail',
  Address: 'map-pin',
  City: 'building',
  State: 'map',
  Pincode: 'hash',
  'Date of Birth': 'calendar',
  Anniversary: 'heart',
};

const PROFESSIONAL_ICONS = {
  Company: 'briefcase',
  'RERA Number': 'file-text',
  'Registration Date': 'calendar',
  Status: 'shield',
};

/** Figma frame: `user-detail-screen` (12:698). */
export default function RegistrationDetailScreen({ route }) {
  const { registrations } = useApp();
  const record = registrations.find((r) => r.id === route.params?.id) || registrations[0];

  return (
    <Screen showBack>
      <PageTitle>Registration Details</PageTitle>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
        <Card style={s.headCard}>
          <Avatar source={record.avatar} name={record.name} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{record.name}</Text>
            <StatusPill label={record.type} tone="warning" style={{ marginTop: spacing.xs }} />
          </View>
        </Card>

        <Card>
          <Text style={s.cardTitle}>Personal Information</Text>
          <Divider style={{ marginVertical: spacing.md }} />
          <View style={{ gap: spacing.lg }}>
            {Object.entries(record.personal).map(([label, value]) => (
              <KeyValue key={label} label={label} value={value} icon={PERSONAL_ICONS[label]} compact />
            ))}
          </View>
        </Card>

        <Card>
          <Text style={s.cardTitle}>Professional Details</Text>
          <Divider style={{ marginVertical: spacing.md }} />
          <View style={{ gap: spacing.lg }}>
            {Object.entries(record.professional).map(([label, value]) =>
              label === 'Status' ? (
                <View key={label} style={{ flexDirection: 'row', gap: spacing.md }}>
                  <View style={{ flex: 1 }}>
                    <Text style={s.statusLabel}>{label}</Text>
                    <StatusPill label={value} tone="success" style={{ marginTop: spacing.xs }} />
                  </View>
                </View>
              ) : (
                <KeyValue key={label} label={label} value={value} icon={PROFESSIONAL_ICONS[label]} compact />
              )
            )}
          </View>
        </Card>

        <PrimaryButton
          label="Edit Profile"
          onPress={() => Alert.alert('Edit Profile', `Editing ${record.name}'s registration.`)}
        />
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  headCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  name: { ...type.heading, color: colors.onSurface },
  cardTitle: { ...type.heading, color: colors.onSurface },
  statusLabel: { ...type.caption, color: colors.muted, marginLeft: 28 },
});
