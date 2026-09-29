import React from 'react';
import { View, Text, Image, StyleSheet, Pressable } from 'react-native';
import Screen from '../components/Screen';
import { Card, Divider } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { news } from '../data';

/** Figma frame: `news-detail-screen` (12:2736). */
export default function NewsDetailScreen({ navigation, route }) {
  const article = news.find((n) => n.id === route.params?.id) || news[0];
  const related = (article.related || [])
    .map((id) => news.find((n) => n.id === id))
    .filter(Boolean);

  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <Image source={article.hero} style={s.hero} resizeMode="cover" />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <View style={s.metaRow}>
          <View style={s.tag}>
            <Text style={s.tagLabel}>{article.tag.toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }} />
          <Text style={s.metaText}>{`${article.fullDate}  •  ${article.readTime}`}</Text>
        </View>

        <Text style={s.title}>{article.title}</Text>
        <Text style={s.author}>{article.author}</Text>
        <Text style={s.desk}>{article.desk}</Text>

        <Divider style={{ marginVertical: spacing.lg }} />

        {article.body.map((para, i) => (
          <Text key={i} style={s.para}>{para}</Text>
        ))}

        {related.length ? (
          <>
            <Divider style={{ marginVertical: spacing.lg }} />
            <Text style={s.relatedTitle}>Related News</Text>
            <View style={{ gap: spacing.md, marginTop: spacing.md }}>
              {related.map((r) => (
                <Card
                  key={r.id}
                  style={s.relatedCard}
                  onPress={() => navigation.push('NewsDetail', { id: r.id })}
                >
                  <Image source={r.thumb} style={s.relatedThumb} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    <View style={s.relatedTag}>
                      <Text style={s.relatedTagLabel}>{r.tag}</Text>
                    </View>
                    <Text style={s.relatedHeadline} numberOfLines={2}>{r.title}</Text>
                    <Text style={s.relatedDate}>{r.fullDate}</Text>
                  </View>
                </Card>
              ))}
            </View>
          </>
        ) : null}
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  hero: { width: '100%', height: 220 },
  metaRow: { flexDirection: 'row', alignItems: 'center' },
  tag: {
    height: 26,
    paddingHorizontal: spacing.md,
    borderRadius: radius.sm,
    backgroundColor: colors.brand,
    justifyContent: 'center',
  },
  tagLabel: { ...type.caption, color: colors.onBrand, letterSpacing: 1.5 },
  metaText: { ...type.caption, color: colors.brandPrimary },

  title: { ...type.display, color: colors.onSurface, marginTop: spacing.lg },
  author: { ...type.bodySmall, color: colors.onSurfaceTertiary, marginTop: spacing.md },
  desk: { ...type.bodySmall, color: colors.success, marginTop: 2 },

  para: { ...type.body, color: colors.onSurfaceTertiary, lineHeight: 26, marginBottom: spacing.lg },

  relatedTitle: { ...type.heading, color: colors.onSurface },
  relatedCard: { flexDirection: 'row', gap: spacing.md, alignItems: 'center', padding: spacing.md },
  relatedThumb: { width: 76, height: 60, borderRadius: radius.md },
  relatedTag: {
    alignSelf: 'flex-start',
    height: 22,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.sm,
    backgroundColor: colors.surfaceTertiary,
    justifyContent: 'center',
  },
  relatedTagLabel: { ...type.caption, color: colors.onSurfaceTertiary },
  relatedHeadline: { ...type.bodySmall, color: colors.onSurface, marginTop: spacing.xs },
  relatedDate: { ...type.caption, color: colors.brandPrimary, marginTop: 2 },
});
