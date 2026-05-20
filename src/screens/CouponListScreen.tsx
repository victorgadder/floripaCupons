import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { CouponCard } from '../components/CouponCard';
import { useCouponStore } from '../store/couponStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { CouponListScreenProps } from '../types/navigation';

export const CouponListScreen = ({ navigation }: CouponListScreenProps) => {
  const coupons = useCouponStore((state) => state.coupons);
  const insets = useSafeAreaInsets();

  return (
    <View style={styles.container}>
      <FlatList
        ListHeaderComponent={
          <View style={styles.hero}>
            <Text style={styles.eyebrow}>Floripa em Dobro</Text>
            <Text style={styles.heading}>Cupons disponiveis</Text>
            <Text style={styles.summary}>
              {coupons.length} oportunidades para aproveitar em dobro.
            </Text>
          </View>
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: insets.bottom + spacing.xl },
        ]}
        data={coupons}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(coupon) => coupon.id}
        renderItem={({ item }) => (
          <CouponCard
            coupon={item}
            onPress={() =>
              navigation.navigate('CouponForm', {
                couponId: item.id,
              })
            }
          />
        )}
      />

      <Pressable
        accessibilityRole="button"
        onPress={() => navigation.navigate('CouponForm')}
        style={({ pressed }) => [
          styles.fab,
          { bottom: insets.bottom + spacing.lg },
          pressed && styles.fabPressed,
        ]}
      >
        <Text style={styles.fabText}>+</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  eyebrow: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  fab: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 28,
    elevation: 4,
    height: 56,
    justifyContent: 'center',
    position: 'absolute',
    right: spacing.lg,
    shadowColor: '#000000',
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
    width: 56,
  },
  fabPressed: {
    backgroundColor: colors.primaryDark,
  },
  fabText: {
    color: colors.surface,
    fontSize: 30,
    fontWeight: '600',
    marginTop: -2,
  },
  heading: {
    color: colors.text,
    fontSize: typography.title,
    fontWeight: '900',
    lineHeight: 30,
    marginTop: spacing.xs,
  },
  hero: {
    paddingBottom: spacing.lg,
  },
  listContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
  },
  separator: {
    height: spacing.md,
  },
  summary: {
    color: colors.textMuted,
    fontSize: typography.body,
    lineHeight: 20,
    marginTop: spacing.xs,
  },
});
