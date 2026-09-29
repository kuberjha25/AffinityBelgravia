import React from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import Screen, { PageTitle } from '../components/Screen';
import Icon from '../components/Icon';
import { Card, Divider } from '../components/ui';
import { colors, radius, spacing, type } from '../theme';
import { notificationsFooter } from '../data';
import { useApp } from '../store';

/** Figma frame: `meraqui-notifications-screen` (12:2972). */
export default function NotificationsScreen() {
  const { notifications, markAllNotificationsRead } = useApp();

  return (
    <Screen showBack contentContainerStyle={{ paddingBottom: spacing.xxl }}>
      <PageTitle>Notifications</PageTitle>

      <View style={{ paddingHorizontal: spacing.lg, gap: spacing.lg }}>
        {notifications.map((group) => (
          <View key={group.group}>
            <Text style={s.groupLabel}>{group.group}</Text>
            <Card style={{ padding: 0 }}>
              {group.items.map((item, i) => (
                <View key={item.id}>
                  {i > 0 ? <Divider style={{ marginHorizontal: spacing.lg }} /> : null}
                  <View style={s.row}>
                    <View style={s.icon}>
                      <Icon name="bell" size={18} color={colors.brandPrimary} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={s.headRow}>
                        <Text style={s.title}>{item.title}</Text>
                        <Text style={s.time}>{item.time}</Text>
                      </View>
                      <Text style={s.body}>{item.body}</Text>
                    </View>
                    {item.unread ? <View style={s.unreadDot} /> : null}
                  </View>
                </View>
              ))}
            </Card>
          </View>
        ))}

        <View style={s.footer}>
          <Text style={s.footerText}>{notificationsFooter}</Text>
          <Pressable onPress={markAllNotificationsRead} hitSlop={8}>
            <Text style={s.markAll}>Mark all as read</Text>
          </Pressable>
        </View>
      </View>
    </Screen>
  );
}

const s = StyleSheet.create({
  groupLabel: { ...type.bodySmall, color: colors.muted, marginBottom: spacing.sm },
  row: { flexDirection: 'row', gap: spacing.md, padding: spacing.lg },
  icon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.glassTint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.sm },
  title: { ...type.body, color: colors.onSurface, flex: 1 },
  time: { ...type.caption, color: colors.onSurfaceTertiary, letterSpacing: 0.5 },
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
