import React, { useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert, ScrollView } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import DateField from '../components/DateField';
import { Avatar, Card, Divider, BottomSheet, TextField, PrimaryButton, StateCityFields } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { brand, images } from '../data';
import { imageFill } from '../components/fill';
import { digits, fromApiDate, humanize, orDash, storageUrl, toApiDate } from '../format';
import { usePermissions } from '../store';
import { fetchProfile, logout, updateProfile } from '../store/slices/authSlice';

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Figma frame: `my-profile` (12:2796). */
export default function MyProfileScreen({ navigation }) {
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.user);
  const stats = useSelector((state) => state.auth.stats);
  const profileStatus = useSelector((state) => state.auth.profileStatus);
  const { isStaff } = usePermissions();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [draft, setDraft] = useState({});

  const partner = user?.partner_profile || null;
  const dob = partner?.date_of_birth || user?.date_of_birth;
  const anniversary = partner?.anniversary || user?.anniversary;
  const address = [user?.address, user?.city, user?.state, user?.pincode].filter(Boolean).join(', ');
  const roleLabel = partner?.partner_type ? humanize(partner.partner_type) : user?.role?.name || (isStaff ? 'Staff' : 'Partner');
  const photo = user?.profile_photo ? { uri: storageUrl(user.profile_photo) } : null;

  const statCards = [
    { id: 'enquiries', icon: 'home', label: 'Enquiries', value: stats?.enquiries, route: 'Leads', params: { status: '' } },
    { id: 'visits', icon: 'calendar', label: 'Site Visits', value: stats?.site_visits, route: 'Visits', params: { status: '' } },
    { id: 'bookings', icon: 'briefcase', label: 'Bookings', value: stats?.bookings, route: 'Leads', params: { status: 'booked' } },
  ];

  const rows = [
    { key: 'name', icon: 'user', label: 'Full Name', value: user?.name },
    { key: 'mobile', icon: 'phone', label: 'Phone Number', value: user?.mobile ? `+91 ${user.mobile}` : '' },
    { key: 'email', icon: 'mail', label: 'Email Address', value: user?.email },
    { key: 'dob', icon: 'calendar', label: 'Date of Birth', value: fromApiDate(dob) },
    { key: 'address', icon: 'map-pin', label: 'Address', value: address },
  ];

  const startEdit = () => {
    const [firstName, ...rest] = (user?.name || '').split(' ');
    setDraft({
      firstName: firstName || '',
      lastName: rest.join(' '),
      email: user?.email || '',
      address: user?.address || '',
      city: user?.city || '',
      state: user?.state || '',
      pincode: user?.pincode || '',
      dob: fromApiDate(dob),
      anniversary: fromApiDate(anniversary),
      photo: null,
    });
    setEditing(true);
  };

  const pickPhoto = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({ type: ['image/jpeg', 'image/png'], copyToCacheDirectory: true });
      const asset = res.canceled ? null : res.assets?.[0];
      if (!asset) return;
      setDraft((d) => ({
        ...d,
        photo: { uri: asset.uri, name: asset.name, type: asset.mimeType || 'image/jpeg', file: asset.file },
      }));
    } catch {
      Alert.alert('Photo', 'Could not open the picker. Please try again.');
    }
  };

  const save = async () => {
    if (draft.email && !EMAIL.test(draft.email.trim())) {
      Alert.alert('Email address', 'Please enter a valid email address.');
      return;
    }
    const fields = {
      first_name: draft.firstName.trim() || undefined,
      last_name: draft.lastName.trim() || undefined,
      email: draft.email.trim() || undefined,
      address: draft.address.trim() || undefined,
      city: draft.city || undefined,
      state: draft.state || undefined,
      pincode: draft.pincode || undefined,
      date_of_birth: toApiDate(draft.dob) || undefined,
      anniversary: toApiDate(draft.anniversary) || undefined,
    };
    Object.keys(fields).forEach((k) => fields[k] === undefined && delete fields[k]);
    setSaving(true);
    try {
      await dispatch(updateProfile({ fields, photo: draft.photo })).unwrap();
      setEditing(false);
    } catch (message) {
      Alert.alert('Could not save', String(message));
    } finally {
      setSaving(false);
    }
  };

  const confirmLogout = () =>
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await dispatch(logout());
          navigation.getParent()?.reset({ index: 0, routes: [{ name: 'Login' }] });
        },
      },
    ]);

  return (
    <Screen
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshing={profileStatus === 'loading' && Boolean(user)}
      onRefresh={() => dispatch(fetchProfile())}
    >
      <View style={{ paddingHorizontal: spacing.lg }}>
        <View style={s.profileCard}>
          <Image source={images.coverProfile} style={imageFill} resizeMode="cover" />
          <LinearGradient colors={['rgba(28,27,25,0.15)', 'rgba(28,27,25,0.6)']} style={StyleSheet.absoluteFill} />
          <View style={s.profileBody}>
            {photo ? <Image source={photo} style={s.avatar} /> : <Avatar name={user?.name || ''} size={72} style={s.avatarFallback} />}
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={s.profileName}>{user?.name || '—'}</Text>
              <Text style={s.profileRole}>{[roleLabel, user?.employee_id ? `ID: ${user.employee_id}` : user?.id ? `ID: ${user.id}` : null].filter(Boolean).join(' • ')}</Text>
              {user?.mobile ? <ProfileLine icon="phone" text={`+91 ${user.mobile}`} /> : null}
              {user?.email ? <ProfileLine icon="mail" text={user.email} /> : null}
              {address ? <ProfileLine icon="map-pin" text={address} /> : null}
            </View>
          </View>
        </View>

        {partner?.status === 'pending' ? (
          <Card style={{ marginTop: spacing.lg }}>
            <Text style={s.cardTitle}>Registration under review</Text>
            <Text style={s.hint}>Our team is reviewing your registration. Some features may be limited until it is approved.</Text>
          </Card>
        ) : null}

        <View style={s.statRow}>
          {statCards.map((stat) => (
            <Pressable
              key={stat.id}
              style={s.statCard}
              onPress={() => navigation.navigate(stat.route, { ...stat.params, at: Date.now() })}
            >
              <View style={s.statIcon}>
                <Icon name={stat.icon} size={18} color={colors.brandPrimary} />
              </View>
              <Text style={s.statValue}>{stat.value ?? '—'}</Text>
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
            <Pressable style={s.editBtn} onPress={startEdit} disabled={!user}>
              <Icon name="edit" size={14} color={colors.brandPrimary} />
              <Text style={s.editLabel}>Edit</Text>
            </Pressable>
          </View>

          {rows.map((row, i) => (
            <View key={row.key}>
              {i > 0 ? <Divider style={{ marginHorizontal: spacing.lg }} /> : null}
              <View style={s.detailRow}>
                <Icon name={row.icon} size={18} color={colors.brandPrimary} />
                <Text style={s.detailLabel}>{row.label}</Text>
                <Text style={s.detailValue} numberOfLines={1}>{orDash(row.value)}</Text>
              </View>
            </View>
          ))}
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

        <Pressable style={s.logout} onPress={confirmLogout}>
          <Icon name="log-out" size={16} color={colors.brandPrimary} />
          <Text style={s.logoutLabel}>Log Out</Text>
        </Pressable>

        <Text style={s.version}>{`Version ${brand.version}`}</Text>
      </View>

      <BottomSheet visible={editing} onClose={() => setEditing(false)} title="Edit Profile">
        <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ gap: spacing.md }} keyboardShouldPersistTaps="handled">
          <Pressable style={s.photoRow} onPress={pickPhoto}>
            {draft.photo ? (
              <Image source={{ uri: draft.photo.uri }} style={s.photoThumb} />
            ) : photo ? (
              <Image source={photo} style={s.photoThumb} />
            ) : (
              <Avatar name={user?.name || ''} size={48} />
            )}
            <Text style={s.editLabel}>{draft.photo ? 'Photo selected' : 'Change photo'}</Text>
          </Pressable>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <TextField label="First Name" value={draft.firstName} onChangeText={(v) => setDraft({ ...draft, firstName: v })} style={{ flex: 1 }} />
            <TextField label="Last Name" value={draft.lastName} onChangeText={(v) => setDraft({ ...draft, lastName: v })} style={{ flex: 1 }} />
          </View>
          <TextField label="Email Address" value={draft.email} onChangeText={(v) => setDraft({ ...draft, email: v })} icon="mail" autoCapitalize="none" keyboardType="email-address" />
          <TextField label="Address" value={draft.address} onChangeText={(v) => setDraft({ ...draft, address: v })} icon="map-pin" />
          <StateCityFields row state={draft.state} city={draft.city} onChange={({ state, city }) => setDraft({ ...draft, state, city })} />
          <TextField label="PIN Code" value={draft.pincode} onChangeText={(v) => setDraft({ ...draft, pincode: digits(v, 6) })} icon="hash" keyboardType="number-pad" maxLength={6} />
          <DateField label="Date of Birth" value={draft.dob} onChange={(v) => setDraft({ ...draft, dob: v })} />
          <DateField label="Anniversary" value={draft.anniversary} onChange={(v) => setDraft({ ...draft, anniversary: v })} />
        </ScrollView>
        <PrimaryButton label="Save Changes" onPress={save} loading={saving} />
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
  profileCard: { minHeight: 168, borderRadius: radius.xl, overflow: 'hidden', justifyContent: 'center' },
  profileBody: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg, padding: spacing.lg },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
  avatarFallback: { borderRadius: 36, borderWidth: 2, borderColor: 'rgba(255,255,255,0.7)' },
  profileName: { ...type.heading, color: colors.onSurfaceInverse },
  profileRole: { ...type.bodySmall, color: 'rgba(255,255,255,0.85)' },
  inline: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  profileLine: { ...type.bodySmall, color: colors.onSurfaceInverse, flex: 1 },
  hint: { ...type.caption, color: colors.muted, marginTop: spacing.xs },

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

  photoRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  photoThumb: { width: 48, height: 48, borderRadius: 24 },
});
