import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Pressable, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import { Avatar, Card, Divider, KeyValue, StatusPill, LoadingState, ErrorState, toneForStatus } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { orDash } from '../format';
import { fetchRegistration } from '../store/slices/registrationsSlice';

const PERSONAL = [
  ['mobile_number', 'Mobile', 'phone'],
  ['email_address', 'Email', 'mail'],
  ['address', 'Address', 'map-pin'],
  ['city', 'City', 'building'],
  ['state', 'State', 'map'],
  ['date_of_birth', 'Date of Birth', 'calendar'],
  ['anniversary_date', 'Anniversary', 'heart'],
];

const BUSINESS = [
  ['company_name', 'Company', 'briefcase'],
  ['business_type', 'Business Type', 'building-2'],
  ['gst_number', 'GST Number', 'file-text'],
  ['pan_number', 'PAN Number', 'file-text'],
  ['rera_number', 'RERA Number', 'file-text'],
  ['msme_number', 'MSME Number', 'file-text'],
];

/** Figma frame: `user-detail-screen` (12:698). */
export default function RegistrationDetailScreen({ route }) {
  const dispatch = useDispatch();
  const id = route.params?.id;
  const record = useSelector((state) => state.registrations.details[id]);
  const status = useSelector((state) => state.registrations.detailsStatus[id]);
  const error = useSelector((state) => state.registrations.detailsError[id]);

  useEffect(() => {
    if (id) dispatch(fetchRegistration(id));
  }, [dispatch, id]);

  if (!record) {
    return (
      <Screen showBack>
        <PageTitle>Registration Details</PageTitle>
        {status === 'failed' ? <ErrorState message={error} onRetry={() => dispatch(fetchRegistration(id))} /> : <LoadingState />}
      </Screen>
    );
  }

  const header = record.header || {};
  const personal = record.personal_information || {};
  const business = record.business_information;
  const documents = record.documents_submitted || [];
  const hasBusiness = business && BUSINESS.some(([key]) => orDash(business[key]) !== '—');

  return (
    <Screen showBack onRefresh={() => dispatch(fetchRegistration(id))}>
      <PageTitle>Registration Details</PageTitle>

      <View style={{ paddingHorizontal: spacing.xl, gap: spacing.lg }}>
        <Card style={s.headCard}>
          <Avatar name={personal.full_name || ''} size={56} />
          <View style={{ flex: 1 }}>
            <Text style={s.name}>{orDash(personal.full_name)}</Text>
            <View style={{ flexDirection: 'row', gap: spacing.sm, flexWrap: 'wrap', marginTop: spacing.xs }}>
              {header.category ? <StatusPill label={header.category} tone="warning" /> : null}
              {header.status ? <StatusPill label={header.status} tone={toneForStatus(header.status)} /> : null}
            </View>
            {header.submitted_on ? <Text style={s.submitted}>{`Submitted ${header.submitted_on}`}</Text> : null}
          </View>
        </Card>

        <Card>
          <Text style={s.cardTitle}>Personal Information</Text>
          <Divider style={{ marginVertical: spacing.md }} />
          <View style={{ gap: spacing.lg }}>
            {PERSONAL.map(([key, label, icon]) => (
              <KeyValue key={key} label={label} value={orDash(personal[key])} icon={icon} compact />
            ))}
          </View>
        </Card>

        {hasBusiness ? (
          <Card>
            <Text style={s.cardTitle}>Business Information</Text>
            <Divider style={{ marginVertical: spacing.md }} />
            <View style={{ gap: spacing.lg }}>
              {BUSINESS.map(([key, label, icon]) => (
                <KeyValue key={key} label={label} value={orDash(business[key])} icon={icon} compact />
              ))}
            </View>
          </Card>
        ) : null}

        {documents.length ? (
          <Card>
            <Text style={s.cardTitle}>Documents Submitted</Text>
            <Divider style={{ marginVertical: spacing.md }} />
            <View style={{ gap: spacing.md }}>
              {documents.map((doc) => (
                <Pressable
                  key={doc.id}
                  style={s.docRow}
                  disabled={!doc.file_url}
                  onPress={() => Linking.openURL(doc.file_url)}
                >
                  <View style={s.docIcon}>
                    <Icon name="file-text" size={18} color={colors.brandPrimary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={s.docTitle}>{doc.name}</Text>
                    {doc.original_name ? <Text style={s.docMeta} numberOfLines={1}>{doc.original_name}</Text> : null}
                  </View>
                  {doc.status ? <StatusPill label={doc.status} tone={toneForStatus(doc.status)} /> : null}
                  {doc.file_url ? <Icon name="download" size={16} color={colors.brandPrimary} /> : null}
                </Pressable>
              ))}
            </View>
          </Card>
        ) : null}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  headCard: { flexDirection: 'row', alignItems: 'center', gap: spacing.lg },
  name: { ...type.heading, color: colors.onSurface },
  submitted: { ...type.caption, color: colors.muted, marginTop: spacing.xs },
  cardTitle: { ...type.heading, color: colors.onSurface },
  docRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
  },
  docIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    backgroundColor: colors.glassTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  docTitle: { ...type.bodySmall, color: colors.onSurface },
  docMeta: { ...type.caption, color: colors.muted, marginTop: 2 },
});
