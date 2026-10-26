import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, Pressable, Linking } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import { Card, Divider, EmptyState, ErrorState, LoadingState } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { notificationsFooter } from '../data';
import { imageSource } from '../format';
import {
  fetchNotifications,
  markAllNotificationsRead,
  markNotificationRead,
  selectUnreadCount,
} from '../store/slices/notificationsSlice';

/** Figma frame: `meraqui-notifications-screen` (12:2972). Latest 20 notifications. */
export default function NotificationsScreen() {
  const dispatch = useDispatch();
  const { items, status, error } = useSelector((state) => state.notifications);
  const unread = useSelector(selectUnreadCount);

  useEffect(() => {
    dispatch(fetchNotifications());
  }, [dispatch]);

  const onPress = (item) => {
    if (!item.is_read) dispatch(markNotificationRead(item.id));
    if (item.action_link) Linking.openURL(item.action_link).catch(() => {});
  };

  return (
    <Screen
      showBack
      contentContainerStyle={{ paddingBottom: spacing.xxl }}
      refreshing={status === 'loading' && items.length > 0}
      onRefresh={() => dispatch(fetchNotifications())}
    >
      <PageTitle>Notifications</PageTitle>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.lg }}>
        {items.length ? (
          <Card style={{ padding: 0 }}>
            {items.map((item, i) => (
              <View key={item.id}>
                {i > 0 ? <Divider style={{ marginHorizontal: spacing.lg }} /> : null}
                <Pressable style={({ pressed }) => [s.row, pressed && { opacity: 0.8 }]} onPress={() => onPress(item)}>
                  {item.image_url ? (
                    <Image source={imageSource(item.image_url)} style={s.thumb} />
                  ) : (
                    <View style={s.icon}>
                      <Icon name="bell" size={18} color={colors.brandPrimary} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <View style={s.headRow}>
                      <Text style={[s.title, !item.is_read && s.titleUnread]}>{item.title}</Text>
                      <Text style={s.time}>{item.created_at}</Text>
                    </View>
                    {item.type ? <Text style={s.type}>{item.type}</Text> : null}
                    <Text style={s.body}>{item.message}</Text>
                  </View>
                  {!item.is_read ? <View style={s.unreadDot} /> : null}
                </Pressable>
              </View>
            ))}
          </Card>
        ) : null}

        {status === 'loading' && !items.length ? <LoadingState /> : null}
        {status === 'failed' && !items.length ? <ErrorState message={error} onRetry={() => dispatch(fetchNotifications())} /> : null}
        {status === 'succeeded' && !items.length ? (
          <EmptyState icon="bell" title="No notifications yet" body="Offers, news and updates will show up here." />
        ) : null}

        <View style={s.footer}>
          <Text style={s.footerText}>{notificationsFooter}</Text>
          {unread > 0 ? (
            <Pressable onPress={() => dispatch(markAllNotificationsRead())} hitSlop={8}>
              <Text style={s.markAll}>Mark all as read</Text>
            </Pressable>
          ) : null}
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: { width: 36, height: 36, borderRadius: radius.md },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...type.body, color: colors.onSurface, flex: 1 },
  titleUnread: { fontFamily: type.heading.fontFamily },
  time: { ...type.caption, color: colors.onSurfaceTertiary, letterSpacing: 0.5 },
  type: { ...type.caption, color: colors.brandPrimary, marginTop: 2 },
  body: { ...type.bodySmall, color: colors.muted, marginTop: spacing.xs, lineHeight: 22 },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.brand,
    alignSelf: 'flex-end',
  },
  footer: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.lg },
  footerText: { ...type.caption, color: colors.muted, flex: 1, lineHeight: 18 },
  markAll: { ...type.bodySmall, color: colors.brandPrimary },
});
