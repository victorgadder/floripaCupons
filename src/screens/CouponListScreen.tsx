import { useState } from 'react';
import {
  FlatList,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import type { ComponentType } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import BarButecoIcon from '../../assets/icons/barButeco.svg';
import ExtraIcon from '../../assets/icons/extra.svg';
import HamburgueriaIcon from '../../assets/icons/hamburgueria.svg';
import OrientalIcon from '../../assets/icons/oriental.svg';
import PizzariaIcon from '../../assets/icons/pizzaria.svg';
import RestauranteIcon from '../../assets/icons/restaurante.svg';
import SearchButtonIcon from '../../assets/icons/searchButton.svg';
import SearchIcon from '../../assets/icons/searchIcon.svg';
import TodosIcon from '../../assets/icons/todos.svg';
import { CouponCard } from '../components/CouponCard';
import { useCouponStore } from '../store/couponStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { CouponListScreenProps } from '../types/navigation';

type CategoryId =
  | 'todos'
  | 'extra'
  | 'hamburgueria'
  | 'restaurante'
  | 'pizzaria'
  | 'oriental'
  | 'barButeco';

type Category = {
  id: CategoryId;
  label: string;
  Icon: ComponentType<SvgProps>;
};

const HEADER_HEIGHT = 158;
const SEARCH_HEIGHT = 27;
const SEARCH_WIDTH = 290;

const categories: Category[] = [
  { id: 'todos', label: 'Todos', Icon: TodosIcon },
  { id: 'extra', label: 'EXTRA', Icon: ExtraIcon },
  { id: 'hamburgueria', label: 'Hamburgueria', Icon: HamburgueriaIcon },
  { id: 'restaurante', label: 'Restaurante', Icon: RestauranteIcon },
  { id: 'pizzaria', label: 'Pizzaria', Icon: PizzariaIcon },
  { id: 'oriental', label: 'Oriental', Icon: OrientalIcon },
  { id: 'barButeco', label: 'Bar/Buteco', Icon: BarButecoIcon },
];

export const CouponListScreen = ({ navigation }: CouponListScreenProps) => {
  const coupons = useCouponStore((state) => state.coupons);
  const insets = useSafeAreaInsets();
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('todos');

  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Pressable
          accessibilityRole="button"
          onPress={() => undefined}
          style={({ pressed }) => [styles.loginButton, pressed && styles.pressed]}
        >
          <Text style={styles.loginText}>Login / Cadastro</Text>
        </Pressable>
      </View>

      <View style={styles.searchBar}>
        <SearchIcon color={colors.surface} height={16} width={16} />
        <Text numberOfLines={1} style={styles.searchPlaceholder}>
          Busque estabelecimentos, bairro, categoria
        </Text>
        <SearchButtonIcon color={colors.surface} height={16} width={16} />
      </View>

      <View style={styles.categoryCarousel}>
        <ScrollView
          contentContainerStyle={styles.categoryContent}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {categories.map(({ id, label, Icon }) => {
            const selected = selectedCategory === id;
            const tintColor = selected ? colors.selected : colors.surface;

            return (
              <Pressable
                accessibilityRole="button"
                key={id}
                onPress={() => setSelectedCategory(id)}
                style={styles.categoryButton}
              >
                <View style={styles.categoryIconBox}>
                  <Icon color={tintColor} height={24} width={28} />
                </View>
                <Text
                  numberOfLines={1}
                  style={[styles.categoryLabel, { color: tintColor }]}
                >
                  {label}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      </View>

      <FlatList
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
  categoryButton: {
    alignItems: 'center',
    height: 83,
    justifyContent: 'flex-end',
    width: 68,
  },
  categoryCarousel: {
    backgroundColor: colors.background,
    height: 83,
  },
  categoryContent: {
    alignItems: 'flex-end',
    paddingHorizontal: 12,
  },
  categoryIconBox: {
    alignItems: 'center',
    height: 60,
    justifyContent: 'flex-end',
    width: 60,
  },
  categoryLabel: {
    fontFamily: typography.family.bold,
    fontSize: 7,
    lineHeight: 10,
    marginBottom: 6,
    marginTop: 2,
    textAlign: 'center',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
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
    fontFamily: typography.family.semiBold,
    fontSize: 30,
    marginTop: -2,
  },
  listContent: {
    paddingHorizontal: 21,
    paddingTop: 0,
  },
  loginButton: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.login,
    borderRadius: 13,
    height: 25,
    justifyContent: 'center',
    position: 'absolute',
    top: 89,
    width: 140,
  },
  loginText: {
    color: colors.surface,
    fontFamily: typography.family.semiBold,
    fontSize: 12,
    lineHeight: 16,
  },
  pressed: {
    opacity: 0.72,
  },
  searchBar: {
    alignItems: 'center',
    alignSelf: 'center',
    backgroundColor: colors.background,
    borderColor: colors.surface,
    borderRadius: 14,
    borderWidth: 1,
    flexDirection: 'row',
    height: SEARCH_HEIGHT,
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    position: 'absolute',
    top: HEADER_HEIGHT - SEARCH_HEIGHT / 2,
    width: SEARCH_WIDTH,
    zIndex: 2,
  },
  searchPlaceholder: {
    color: colors.placeholder,
    flex: 1,
    fontFamily: typography.family.regular,
    fontSize: 9,
    lineHeight: 12,
    marginHorizontal: 6,
  },
  separator: {
    height: spacing.md,
  },
  topSection: {
    backgroundColor: colors.header,
    height: HEADER_HEIGHT,
  },
});
