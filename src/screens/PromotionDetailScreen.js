import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Alert, Linking, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { Card, Divider, LoadingState, ErrorState, SecondaryButton } from '../components/ui';
import { colors, radius, spacing, type, borderWidth } from '../theme';
import { images, rsvpOptions } from '../data';
import { fromApiDate, humanize, imageSource, plainParagraphs, timeLabel } from '../format';
import { fetchPromotion, rsvpPromotion } from '../store/slices/contentSlice';

/**
 * A promotion (offer / campaign / incentive / event), opened from the Home
 * banners. Events carry an RSVP card (POST /promotions/{id}/rsvp), pre-set
 * from the partner's saved `rsvp_status`.
 */
export default function PromotionDetailScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const id = route.params?.id;
  const listRow = useSelector((state) => state.content.promotions.items.find((p) => p.id === id));
  const detail = useSelector((state) => state.content.promotionItems[id]);
  const status = useSelector((state) => state.content.promotionItemsStatus[id]);
  const error = useSelector((state) => state.content.promotionItemsError[id]);
  const promo = detail || listRow;
  const [saving, setSaving] = useState(null);

  useEffect(() => {
    if (id) dispatch(fetchPromotion(id));
  }, [dispatch, id]);

  if (!promo) {
    return (
      <Screen showBack>
        {status === 'failed' ? <ErrorState message={error} onRetry={() => dispatch(fetchPromotion(id))} /> : <LoadingState />}
      </Screen>
    );
  }

  const isEvent = promo.promotion_type === 'event';
  const benefits = Array.isArray(promo.benefits) ? promo.benefits : [];
  const body = plainParagraphs(promo.description);
  const when = [
    promo.start_date ? `${fromApiDate(promo.start_date)}${promo.start_time ? `, ${timeLabel(promo.start_time)}` : ''}` : null,
    promo.end_date ? `${fromApiDate(promo.end_date)}${promo.end_time ? `, ${timeLabel(promo.end_time)}` : ''}` : null,
  ]
    .filter(Boolean)
    .join('  –  ');

  const rsvp = async (choice) => {
    if (choice === promo.rsvp_status) return;
    setSaving(choice);
    try {
      const message = await dispatch(rsvpPromotion({ id: promo.id, status: choice })).unwrap();
      Alert.alert('RSVP saved', message);
    } catch (message) {
      Alert.alert('Could not save RSVP', String(message));
    } finally {
      setSaving(null);
    }
  };

  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }} onRefresh={() => dispatch(fetchPromotion(id))}>
      <Image source={imageSource(promo.image_url, images.heroInventory)} style={s.hero} resizeMode="cover" />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg, gap: spacing.lg }}>
        <View style={s.metaRow}>
          <View style={s.tag}>
            <Text style={s.tagLabel}>{(promo.tag_name || humanize(promo.promotion_type)).toUpperCase()}</Text>
          </View>
          {promo.project?.name ? <Text style={s.metaText}>{promo.project.name}</Text> : null}
        </View>

        <View>
          <Text style={s.title}>{promo.title}</Text>
          {promo.short_description ? <Text style={s.lead}>{promo.short_description}</Text> : null}
          {when ? (
            <View style={s.whenRow}>
              <Icon name="calendar" size={14} color={colors.brandPrimary} />
              <Text style={s.metaText}>{when}</Text>
            </View>
          ) : null}
        </View>

        {isEvent ? (
          <Card>
            <Text style={s.cardTitle}>Will you attend?</Text>
            <View style={s.rsvpRow}>
              {rsvpOptions.map((opt) => {
                const active = promo.rsvp_status === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => rsvp(opt.id)}
                    disabled={Boolean(saving)}
                    style={[s.rsvpChip, active && s.rsvpChipActive]}
                  >
                    {saving === opt.id ? (
                      <ActivityIndicator size="small" color={colors.brandPrimary} />
                    ) : (
                      <Text style={[s.rsvpLabel, active && { color: colors.onBrand }]}>{opt.label}</Text>
                    )}
                  </Pressable>
                );
              })}
            </View>
            {promo.rsvp_status ? (
              <Text style={s.small}>{`Your response: ${rsvpOptions.find((o) => o.id === promo.rsvp_status)?.label || humanize(promo.rsvp_status)}`}</Text>
            ) : null}
          </Card>
        ) : null}

        {body.length ? (
          <View style={{ gap: spacing.md }}>
            {body.map((p, i) => (
              <Text key={i} style={s.body}>
                {p}
              </Text>
            ))}
          </View>
        ) : null}

        {benefits.length ? (
          <Card>
            <Text style={s.cardTitle}>Benefits</Text>
            <View style={{ gap: spacing.md, marginTop: spacing.md }}>
              {benefits.map((b, i) => (
                <View key={`${b.title}-${i}`} style={{ flexDirection: 'row', gap: spacing.md }}>
                  <Icon name="circle-check" size={16} color={colors.brandPrimary} />
                  <View style={{ flex: 1 }}>
                    <Text style={s.benefitTitle}>{b.title}</Text>
                    {b.description ? <Text style={s.small}>{b.description}</Text> : null}
                  </View>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {promo.brochure_url ? (
          <SecondaryButton label="View Brochure" icon="download" onPress={() => Linking.openURL(promo.brochure_url)} />
        ) : null}
        {promo.project_id ? (
          <SecondaryButton
            label="View Project"
            icon="building"
            onPress={() => navigation.navigate('ProjectDetail', { id: promo.project_id })}
          />
        ) : null}

        {promo.terms ? (
          <>
            <Divider />
            <Text style={s.termsTitle}>Terms & Conditions</Text>
            {plainParagraphs(promo.terms).map((p, i) => (
              <Text key={i} style={s.small}>
                {p}
              </Text>
            ))}
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { width: '100%', height: 220 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  tag: {
    height: 22,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.brandPrimary,
    justifyContent: 'center',
  },
  tagLabel: { ...type.caption, color: colors.onBrand, letterSpacing: 1 },
  metaText: { ...type.caption, color: colors.muted },
  whenRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, marginTop: spacing.md },
  title: { ...type.title, color: colors.onSurface },
  lead: { ...type.body, color: colors.onSurfaceTertiary, marginTop: spacing.sm },
  body: { ...type.bodySmall, color: colors.onSurfaceTertiary, lineHeight: 22 },
  cardTitle: { ...type.heading, color: colors.onSurface },
  benefitTitle: { ...type.body, color: colors.onSurface },
  small: { ...type.caption, color: colors.muted, marginTop: spacing.xs, lineHeight: 18 },
  termsTitle: { ...type.bodySmall, color: colors.onSurface },
  rsvpRow: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.md },
  rsvpChip: {
    flex: 1,
    height: 40,
    borderRadius: radius.pill,
    borderWidth: borderWidth.default,
    borderColor: colors.border,
    backgroundColor: colors.surfaceSecondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rsvpChipActive: { backgroundColor: colors.brandPrimary, borderColor: colors.brandPrimary },
  rsvpLabel: { ...type.caption, color: colors.onSurfaceTertiary },
});
