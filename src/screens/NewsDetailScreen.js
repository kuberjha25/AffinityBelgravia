import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen from '../components/Screen';
import Icon from '../components/Icon';
import { Card, Divider, LoadingState, ErrorState } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { images } from '../data';
import { fromApiDate, humanize, imageSource, plainParagraphs } from '../format';
import { fetchNewsItem } from '../store/slices/contentSlice';

/** Figma frame: `news-detail-screen` (12:2736). */
export default function NewsDetailScreen({ navigation, route }) {
  const dispatch = useDispatch();
  const id = route.params?.id;
  const article = useSelector((state) => state.content.newsItems[id]);
  const status = useSelector((state) => state.content.newsItemsStatus[id]);
  const error = useSelector((state) => state.content.newsItemsError[id]);
  const others = useSelector((state) => state.content.news.items);

  useEffect(() => {
    if (id) dispatch(fetchNewsItem(id));
  }, [dispatch, id]);

  if (!article) {
    return (
      <Screen showBack>
        {status === 'failed' ? <ErrorState message={error} onRetry={() => dispatch(fetchNewsItem(id))} /> : <LoadingState />}
      </Screen>
    );
  }

  // Related: other loaded stories, same category first.
  const related = others
    .filter((n) => n.id !== article.id)
    .sort((a, b) => (b.category === article.category) - (a.category === article.category))
    .slice(0, 2);
  const body = plainParagraphs(article.content);
  const highlights = Array.isArray(article.highlights) ? article.highlights : [];

  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <Image source={imageSource(article.image_url, images.heroNews)} style={s.hero} resizeMode="cover" />

      <View style={{ paddingHorizontal: spacing.lg, paddingTop: spacing.lg }}>
        <View style={s.metaRow}>
          {article.category ? (
            <View style={s.tag}>
              <Text style={s.tagLabel}>{humanize(article.category).toUpperCase()}</Text>
            </View>
          ) : null}
          <View style={{ flex: 1 }} />
          <Text style={s.metaText}>{fromApiDate(article.publish_date)}</Text>
        </View>

        <Text style={s.title}>{article.title}</Text>
        {article.short_description ? <Text style={s.lead}>{article.short_description}</Text> : null}
        {article.project?.name ? <Text style={s.desk}>{article.project.name}</Text> : null}

        <Divider style={{ marginVertical: spacing.lg }} />

        {body.map((para, i) => (
          <Text key={i} style={s.para}>{para}</Text>
        ))}

        {highlights.length ? (
          <Card style={{ gap: spacing.md, marginBottom: spacing.lg }}>
            <Text style={s.relatedTitle}>Highlights</Text>
            {highlights.map((h, i) => (
              <View key={i} style={{ flexDirection: 'row', gap: spacing.sm }}>
                <Icon name="circle-check" size={16} color={colors.brandPrimary} style={{ marginTop: 3 }} />
                <View style={{ flex: 1 }}>
                  <Text style={s.highlightTitle}>{typeof h === 'string' ? h : h.title}</Text>
                  {h.description ? <Text style={s.highlightBody}>{h.description}</Text> : null}
                </View>
              </View>
            ))}
          </Card>
        ) : null}

        {related.length ? (
          <>
            <Divider style={{ marginBottom: spacing.lg }} />
            <Text style={s.relatedTitle}>Related News</Text>
            <View style={{ gap: spacing.md, marginTop: spacing.md }}>
              {related.map((r) => (
                <Card key={r.id} style={s.relatedCard} onPress={() => navigation.push('NewsDetail', { id: r.id })}>
                  <Image source={imageSource(r.image_url, images.heroNews)} style={s.relatedThumb} resizeMode="cover" />
                  <View style={{ flex: 1 }}>
                    {r.category ? (
                      <View style={s.relatedTag}>
                        <Text style={s.relatedTagLabel}>{humanize(r.category)}</Text>
                      </View>
                    ) : null}
                    <Text style={s.relatedHeadline} numberOfLines={2}>{r.title}</Text>
                    <Text style={s.relatedDate}>{fromApiDate(r.publish_date)}</Text>
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
  lead: { ...type.body, color: colors.onSurfaceTertiary, marginTop: spacing.md },
  desk: { ...type.bodySmall, color: colors.success, marginTop: spacing.sm },

  para: { ...type.body, color: colors.onSurfaceTertiary, lineHeight: 26, marginBottom: spacing.lg },
  highlightTitle: { ...type.bodySmall, color: colors.onSurface },
  highlightBody: { ...type.caption, color: colors.muted, marginTop: 2 },

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
