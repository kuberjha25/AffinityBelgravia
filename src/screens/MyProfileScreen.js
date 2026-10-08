import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { Card, Divider, BottomSheet, TextField, PrimaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { brand } from '../data';
import { useApp } from '../store';
import { imageFill } from '../components/fill';

import { ROLES } from '../permissions';

/** Figma frame: `my-profile` (12:2796). */
export default function MyProfileScreen({ navigation }) {
  const { profile, updateProfile, role, setRole, isStaff, leads, visits, associates } = useApp();

  // Counts from the same records the lists show.
  const stats = profile.stats.map((stat) => {
    if (stat.id === 'enquiries') return { ...stat, value: leads.length, route: 'Leads', params: { status: 'All' } };
    if (stat.id === 'visits') return { ...stat, value: visits.length, route: 'Visits', params: { status: 'All' } };
    return isStaff
      ? { ...stat, value: associates.length, route: 'Registrations' }
      : { ...stat, value: leads.filter((l) => l.status === 'Converted').length, route: 'Leads', params: { status: 'Converted' } };
  });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(profile);

  const rows = [
    { key: 'name', icon: 'user', label: 'Full Name', value: profile.name },
    { key: 'phone', icon: 'phone', label: 'Phone Number', value: profile.phone },
    { key: 'email', icon: 'mail', label: 'Email Address', value: profile.email },
    { key: 'dob', icon: 'calendar', label: 'Date of Birth', value: profile.dob },
    { key: 'address', icon: 'map-pin', label: 'Address', value: profile.address },
  ];

  const save = () => {
    updateProfile(draft);
    setEditing(false);
  };

  return (
    <Screen contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <View style={{ paddingHorizontal: spacing.lg }}>
        <View style={s.profileCard}>
          <Image source={profile.cover} style={imageFill} resizeMode="cover" />
          <LinearGradient colors={['rgba(28,27,25,0.15)', 'rgba(28,27,25,0.6)']} style={StyleSheet.absoluteFill} />
          <View style={s.profileBody}>
            <Image source={profile.avatar} style={s.avatar} />
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.profileName}>{profile.name}</Text>
              <Text style={s.profileRole}>{`${profile.role} • ID: ${profile.partnerId}`}</Text>
              <ProfileLine icon="phone" text={profile.phone} />
              <ProfileLine icon="mail" text={profile.email} />
              <ProfileLine icon="map-pin" text={profile.address} />
            </View>
          </View>
        </View>

        <View style={s.statRow}>
          {stats.map((stat) => (
            <Pressable
              key={stat.id}
              style={s.statCard}
              onPress={() => navigation.navigate(stat.route, stat.params ? { ...stat.params, at: Date.now() } : undefined)}
            >
              <View style={s.statIcon}>
                <Icon name={stat.icon} size={18} color={colors.brandPrimary} />
              </View>
              <Text style={s.statValue}>{stat.value}</Text>
              <Text style={s.statLabel}>{stat.label}</Text>
              <View style={s.inline}>
                <Text style={s.statLink}>View All</Text>
                <Icon name="chevron-right" size={12} color={colors.brandPrimary} />
              </View>
            </Pressable>
          ))}
        </View>

        <Card style={{ marginTop: spacing.lg, padding: 0 }}>
          <View style={s.cardHead}>
            <Text style={s.cardTitle}>Personal Details</Text>
            <Pressable
              style={s.editBtn}
              onPress={() => {
                setDraft(profile);
                setEditing(true);
              }}
            >
              <Icon name="edit" size={14} color={colors.brandPrimary} />
              <Text style={s.editLabel}>Edit</Text>
            </Pressable>
          </View>

          {rows.map((row, i) => (
            <View key={row.key}>
              {i > 0 ? <Divider style={{ marginHorizontal: spacing.lg }} /> : null}
              <Pressable style={s.detailRow}>
                <Icon name={row.icon} size={18} color={colors.brandPrimary} />
                <Text style={s.detailLabel}>{row.label}</Text>
                <Text style={s.detailValue} numberOfLines={1}>{row.value}</Text>
                <Icon name="chevron-right" size={16} color={colors.muted} />
              </Pressable>
            </View>
          ))}
        </Card>

        {/* No backend yet: lets the client try both logins. Remove once roles come from the server. */}
        <Card style={{ marginTop: spacing.lg }}>
          <Text style={s.cardTitle}>Demo: Login as</Text>
          <Text style={s.demoHint}>Switch to preview what each role can see and do.</Text>
          <View style={s.roleRow}>
            {Object.values(ROLES).map((r) => {
              const active = role === r.id;
              return (
                <Pressable
                  key={r.id}
                  onPress={() => {
                    setRole(r.id);
                    navigation.navigate('Home');
                  }}
                  style={[s.roleOption, active && s.roleOptionActive]}
                >
                  <Text style={[s.roleLabel, active && { color: colors.onSurfaceInverse }]}>{r.label}</Text>
                </Pressable>
              );
            })}
          </View>
        </Card>

        <Card style={{ marginTop: spacing.lg, padding: 0 }}>
          <Pressable style={s.linkRow} onPress={() => navigation.navigate('About')}>
            <Icon name="chevron-right" size={16} color={colors.brandPrimary} />
            <Text style={s.linkLabel}>About Us</Text>
            <Icon name="chevron-right" size={16} color={colors.muted} />
          </Pressable>
          <Divider style={{ marginHorizontal: spacing.lg }} />
          <Pressable style={s.linkRow} onPress={() => navigation.navigate('Terms')}>
            <Icon name="chevron-right" size={16} color={colors.brandPrimary} />
            <Text style={s.linkLabel}>Terms &amp; Conditions</Text>
            <Icon name="chevron-right" size={16} color={colors.muted} />
          </Pressable>
        </Card>

        <Pressable
          style={s.logout}
          onPress={() =>
            Alert.alert('Log Out', 'Are you sure you want to log out?', [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Log Out',
                style: 'destructive',
                onPress: () =>
                  navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] }),
              },
            ])
          }
        >
          <Icon name="log-out" size={16} color={colors.brandPrimary} />
          <Text style={s.logoutLabel}>Log Out</Text>
        </Pressable>

        <Text style={s.version}>{`Version ${brand.version}`}</Text>
      </View>

      <BottomSheet visible={editing} onClose={() => setEditing(false)} title="Edit Profile">
        <TextField label="Full Name" value={draft.name} onChangeText={(v) => setDraft({ ...draft, name: v })} icon="user" />
        <TextField label="Phone Number" value={draft.phone} onChangeText={(v) => setDraft({ ...draft, phone: v })} icon="phone" keyboardType="phone-pad" />
        <TextField label="Email Address" value={draft.email} onChangeText={(v) => setDraft({ ...draft, email: v })} icon="mail" autoCapitalize="none" />
        <TextField label="Address" value={draft.address} onChangeText={(v) => setDraft({ ...draft, address: v })} icon="map-pin" />
        <PrimaryButton label="Save Changes" onPress={save} />
      </BottomSheet>
    </Screen>
  );
}

function ProfileLine({ icon, text }) {
  return (
    <View style={s.inline}>
      <Icon name={icon} size={14} color={colors.onSurfaceInverse} />
      <Text style={s.profileLine} numberOfLines={1}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  profileCard: { height: 168, borderRadius: radius.xl, overflow: 'hidden', justifyContent: 'center' },
  profileBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
  profileName: { ...type.heading, color: colors.onSurfaceInverse },
  profileRole: { ...type.bodySmall, color: 'rgba(255,255,255,0.85)' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileLine: { ...type.bodySmall, color: colors.onSurfaceInverse, flex: 1 },

  statRow: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.lg },
  statCard: {
    flex: 1,
    borderRadius: radius.lg,
    backgroundColor: colors.surfaceSecondary,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    padding: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  statIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statValue: { ...type.heading, color: colors.onSurface },
  statLabel: { ...type.caption, color: colors.onSurfaceTertiary },
  statLink: { ...type.caption, color: colors.brandPrimary },

  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
  },
  cardTitle: { ...type.body, color: colors.onSurface },
  editBtn: {
    height: 32,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: borderWidth.default,
    borderColor: colors.brandPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  editLabel: { ...type.caption, color: colors.brandPrimary },

  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  detailLabel: { ...type.bodySmall, color: colors.brandPrimary },
  detailValue: { ...type.bodySmall, color: colors.onSurface, flex: 1, textAlign: 'right' },

  linkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.lg,
  },
  linkLabel: { ...type.body, color: colors.onSurface, flex: 1 },

  logout: {
    marginTop: spacing.lg,
    height: 56,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.brandPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  logoutLabel: { ...type.body, color: colors.brandPrimary },
  version: { ...type.caption, color: colors.muted, textAlign: 'center', marginTop: spacing.md },
  demoHint: { ...type.caption, color: colors.muted, marginTop: spacing.xs },
  roleRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  roleOption: {
    flex: 1,
    minHeight: 48,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  roleOptionActive: { backgroundColor: colors.surfaceInverse, borderColor: colors.brandPrimary },
  roleLabel: { ...type.caption, color: colors.onSurfaceTertiary, textAlign: 'center' },
});
