import { Pressable, StyleSheet, Text, View } from 'react-native';

import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { Coupon } from '../types/coupon';

type CouponCardProps = {
  coupon: Coupon;
  onPress: () => void;
};

export const CouponCard = ({ coupon, onPress }: CouponCardProps) => (
  <Pressable
    accessibilityRole="button"
    onPress={onPress}
    style={({ pressed }) => [styles.card, pressed && styles.pressed]}
  >
    <View style={styles.imagePlaceholder}>
      <Text style={styles.imageText}>{coupon.benefitLabel}</Text>
    </View>

    <View style={styles.content}>
      <View style={styles.header}>
        <Text numberOfLines={1} style={styles.partner}>
          {coupon.partnerName}
        </Text>
        <Text style={styles.favorite}>{coupon.isFavorite ? 'S2' : '+'}</Text>
      </View>

      <Text numberOfLines={2} style={styles.title}>
        {coupon.title}
      </Text>

      <Text numberOfLines={2} style={styles.description}>
        {coupon.description ?? 'Cupom exclusivo Floripa em Dobro.'}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.meta}>{coupon.category}</Text>
        <Text style={styles.dot}>-</Text>
        <Text style={styles.meta}>{coupon.distanceLabel}</Text>
      </View>
      <Text style={styles.expiration}>{coupon.expiresAtLabel}</Text>
    </View>
  </Pressable>
);

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
  },
  content: {
    flex: 1,
    minWidth: 0,
  },
  description: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
  dot: {
    color: colors.textMuted,
    fontSize: typography.caption,
  },
  expiration: {
    color: colors.success,
    fontSize: typography.caption,
    fontWeight: '700',
    marginTop: spacing.sm,
  },
  favorite: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
  },
  footer: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  header: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  imagePlaceholder: {
    alignItems: 'center',
    aspectRatio: 1,
    backgroundColor: '#FFE8E9',
    borderRadius: 12,
    justifyContent: 'center',
    width: 86,
  },
  imageText: {
    color: colors.primaryDark,
    fontSize: typography.caption,
    fontWeight: '800',
    textAlign: 'center',
  },
  meta: {
    color: colors.textMuted,
    fontSize: typography.caption,
    fontWeight: '600',
  },
  partner: {
    color: colors.textMuted,
    flex: 1,
    fontSize: typography.caption,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  pressed: {
    opacity: 0.72,
  },
  title: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '800',
    lineHeight: 23,
    marginTop: spacing.xs,
  },
});
