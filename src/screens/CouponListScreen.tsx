import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  FlatList,
  Image,
  PanResponder,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from 'react-native';
import type { ComponentType } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { SvgProps } from 'react-native-svg';

import BarButecoIcon from '../../assets/icons/barButeco.svg';
import ConfigCupomIcon from '../../assets/icons/configCupom.svg';
import CupomIcon from '../../assets/icons/cupom.svg';
import ExtraIcon from '../../assets/icons/extra.svg';
import HamburgueriaIcon from '../../assets/icons/hamburgueria.svg';
import NewCardIcon from '../../assets/icons/newCard.svg';
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
import type { Coupon } from '../types/coupon';
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

type ScreenMode = 'coupons' | 'manage';

const HEADER_HEIGHT = 158;
const FOOTER_HEIGHT = 93;
const LIST_HORIZONTAL_PADDING = 16;
const PAGE_SIZE = 4;
const SEARCH_HEIGHT = 27;
const SEARCH_WIDTH = 290;
const BANNER_ASPECT_RATIO = 1472 / 812;
const CARD_HEIGHT = 159;
const CARD_GAP = 16;
const CARD_STEP = CARD_HEIGHT + CARD_GAP;
const AUTO_SCROLL_STEP = 18;
const AUTO_SCROLL_THRESHOLD = 90;

const categories: Category[] = [
  { id: 'todos', label: 'Todos', Icon: TodosIcon },
  { id: 'extra', label: 'EXTRA', Icon: ExtraIcon },
  { id: 'hamburgueria', label: 'Hamburgueria', Icon: HamburgueriaIcon },
  { id: 'restaurante', label: 'Restaurante', Icon: RestauranteIcon },
  { id: 'pizzaria', label: 'Pizzaria', Icon: PizzariaIcon },
  { id: 'oriental', label: 'Oriental', Icon: OrientalIcon },
  { id: 'barButeco', label: 'Bar/Buteco', Icon: BarButecoIcon },
];

const isCouponReadyToDisplay = (coupon: Coupon) => coupon.title.trim().length > 0;

type ManageCouponCardProps = {
  coupon: Coupon;
  index: number;
  itemCount: number;
  onDelete: () => void;
  onDragStateChange: (isDragging: boolean) => void;
  onDragMove: (screenY: number) => void;
  onEdit: () => void;
  onMove: (fromIndex: number, toIndex: number) => void;
};

const ManageCouponCard = ({
  coupon,
  index,
  itemCount,
  onDelete,
  onDragStateChange,
  onDragMove,
  onEdit,
  onMove,
}: ManageCouponCardProps) => {
  const dragY = useRef(new Animated.Value(0)).current;
  const wiggle = useRef(new Animated.Value(0)).current;
  const currentIndexRef = useRef(index);
  const dragOriginYRef = useRef(0);
  const isDraggingRef = useRef(false);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    if (!isDraggingRef.current) {
      currentIndexRef.current = index;
    }
  }, [index]);

  const startDragging = () => {
    isDraggingRef.current = true;
    setIsDragging(true);
    onDragStateChange(true);
  };

  const stopDragging = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
    onDragStateChange(false);
    dragY.setValue(0);
  };

  useEffect(() => {
    if (!isDragging) {
      wiggle.stopAnimation();
      wiggle.setValue(0);
      return;
    }

    const animation = Animated.loop(
      Animated.sequence([
        Animated.timing(wiggle, {
          duration: 70,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.timing(wiggle, {
          duration: 70,
          toValue: -1,
          useNativeDriver: true,
        }),
        Animated.timing(wiggle, {
          duration: 70,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    );

    animation.start();

    return () => animation.stop();
  }, [isDragging, wiggle]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: () => isDraggingRef.current,
        onMoveShouldSetPanResponderCapture: () => isDraggingRef.current,
        onPanResponderGrant: () => {
          dragOriginYRef.current = 0;
          dragY.setValue(0);
        },
        onPanResponderMove: (_, gestureState) => {
          const adjustedDragY = gestureState.dy - dragOriginYRef.current;
          const offset = Math.round(adjustedDragY / CARD_STEP);
          const nextIndex = Math.max(
            0,
            Math.min(itemCount - 1, currentIndexRef.current + offset),
          );

          onDragMove(gestureState.moveY);

          if (nextIndex !== currentIndexRef.current) {
            onMove(currentIndexRef.current, nextIndex);
            currentIndexRef.current = nextIndex;
            dragOriginYRef.current = gestureState.dy;
            dragY.setValue(0);
            return;
          }

          dragY.setValue(adjustedDragY);
        },
        onPanResponderRelease: () => {
          stopDragging();
        },
        onPanResponderTerminate: () => {
          stopDragging();
        },
      }),
    [dragY, itemCount, onDragMove, onMove, stopDragging],
  );

  const rotation = wiggle.interpolate({
    inputRange: [-1, 0, 1],
    outputRange: ['-1.5deg', '0deg', '1.5deg'],
  });

  return (
    <Animated.View
      {...panResponder.panHandlers}
      style={[
        isDragging && styles.draggingCard,
        {
          transform: [
            { translateY: dragY },
            { rotate: rotation },
            { scale: isDragging ? 1.015 : 1 },
          ],
        },
      ]}
    >
      <CouponCard
        coupon={coupon}
        mode="manage"
        onDelete={onDelete}
        onEdit={onEdit}
        onLongPress={startDragging}
      />
    </Animated.View>
  );
};

export const CouponListScreen = ({ navigation }: CouponListScreenProps) => {
  const coupons = useCouponStore((state) => state.coupons);
  const deleteCoupon = useCouponStore((state) => state.deleteCoupon);
  const reorderCoupons = useCouponStore((state) => state.reorderCoupons);
  const insets = useSafeAreaInsets();
  const { height, width } = useWindowDimensions();
  const flatListRef = useRef<FlatList<Coupon>>(null);
  const contentHeightRef = useRef(0);
  const scrollOffsetRef = useRef(0);
  const listHeightRef = useRef(0);
  const [screenMode, setScreenMode] = useState<ScreenMode>('coupons');
  const [selectedCategory, setSelectedCategory] = useState<CategoryId>('todos');
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [isDraggingCard, setIsDraggingCard] = useState(false);
  const bannerWidth = width - LIST_HORIZONTAL_PADDING * 2;
  const displayableCoupons = coupons.filter(isCouponReadyToDisplay);
  const listCoupons =
    screenMode === 'manage'
      ? coupons
      : displayableCoupons.slice(0, visibleCount);

  const handleDeleteCoupon = (couponId: string) => {
    Alert.alert('Excluir card', 'Deseja excluir este card?', [
      { style: 'cancel', text: 'Cancelar' },
      {
        onPress: () => deleteCoupon(couponId),
        style: 'destructive',
        text: 'Excluir',
      },
    ]);
  };

  const reorderCouponByIndex = (fromIndex: number, toIndex: number) => {
    const nextCoupons = [...coupons];
    const [selectedCoupon] = nextCoupons.splice(fromIndex, 1);
    nextCoupons.splice(toIndex, 0, selectedCoupon);
    reorderCoupons(nextCoupons);
  };

  const handleDragMove = (screenY: number) => {
    const visibleListHeight =
      listHeightRef.current || height - HEADER_HEIGHT - FOOTER_HEIGHT;
    const maxScrollOffset = Math.max(
      0,
      contentHeightRef.current - visibleListHeight,
    );
    const listTop = HEADER_HEIGHT + 90;
    const listBottom = height - FOOTER_HEIGHT - insets.bottom;
    let nextOffset = scrollOffsetRef.current;

    if (screenY < listTop + AUTO_SCROLL_THRESHOLD) {
      nextOffset = Math.max(0, nextOffset - AUTO_SCROLL_STEP);
    }

    if (screenY > listBottom - AUTO_SCROLL_THRESHOLD) {
      nextOffset = Math.min(maxScrollOffset, nextOffset + AUTO_SCROLL_STEP);
    }

    if (nextOffset !== scrollOffsetRef.current) {
      scrollOffsetRef.current = nextOffset;
      flatListRef.current?.scrollToOffset({
        animated: false,
        offset: nextOffset,
      });
    }
  };

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
        ref={flatListRef}
        ListHeaderComponent={
          screenMode === 'coupons' ? (
            <Image
              source={require('../../assets/banner.png')}
              style={[
                styles.banner,
                {
                  height: bannerWidth / BANNER_ASPECT_RATIO,
                  width: bannerWidth,
                },
              ]}
            />
          ) : null
        }
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: FOOTER_HEIGHT + insets.bottom + spacing.md },
        ]}
        data={listCoupons}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        keyExtractor={(coupon) => coupon.id}
        onEndReached={() =>
          screenMode === 'coupons'
            ? setVisibleCount((currentCount) =>
                Math.min(currentCount + PAGE_SIZE, displayableCoupons.length),
              )
            : undefined
        }
        onEndReachedThreshold={0.6}
        onContentSizeChange={(_, contentHeight) => {
          contentHeightRef.current = contentHeight;
        }}
        onLayout={(event) => {
          listHeightRef.current = event.nativeEvent.layout.height;
        }}
        onScroll={(event) => {
          scrollOffsetRef.current = event.nativeEvent.contentOffset.y;
        }}
        scrollEventThrottle={16}
        scrollEnabled={!isDraggingCard}
        renderItem={({ item }) => (
          screenMode === 'manage' ? (
            <ManageCouponCard
              coupon={item}
              index={coupons.findIndex((coupon) => coupon.id === item.id)}
              itemCount={coupons.length}
              onDelete={() => handleDeleteCoupon(item.id)}
              onDragMove={handleDragMove}
              onDragStateChange={setIsDraggingCard}
              onEdit={() =>
                navigation.navigate('CouponForm', {
                  couponId: item.id,
                })
              }
              onMove={reorderCouponByIndex}
            />
          ) : (
            <CouponCard
              coupon={item}
              mode="coupons"
              onDelete={() => handleDeleteCoupon(item.id)}
              onEdit={() =>
                navigation.navigate('CouponForm', {
                  couponId: item.id,
                })
              }
              onPress={() =>
                navigation.navigate('CouponForm', {
                  couponId: item.id,
                })
              }
            />
          )
        )}
      />

      <View style={styles.footer}>
        <Pressable
          accessibilityRole="button"
          onPress={() => setScreenMode('coupons')}
          style={({ pressed }) => [styles.footerButton, pressed && styles.pressed]}
        >
          <CupomIcon
            color={screenMode === 'coupons' ? colors.selected : colors.surface}
            height={24}
            width={24}
          />
          <Text
            style={[
              styles.footerLabel,
              screenMode === 'coupons' && styles.footerLabelSelected,
            ]}
          >
            Cupons
          </Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => navigation.navigate('CouponForm')}
          style={({ pressed }) => [styles.footerButton, pressed && styles.pressed]}
        >
          <NewCardIcon color={colors.surface} height={24} width={24} />
          <Text style={styles.footerLabel}>Novo Card</Text>
        </Pressable>

        <Pressable
          accessibilityRole="button"
          onPress={() => setScreenMode('manage')}
          style={({ pressed }) => [styles.footerButton, pressed && styles.pressed]}
        >
          <ConfigCupomIcon
            color={screenMode === 'manage' ? colors.selected : colors.surface}
            height={24}
            width={24}
          />
          <Text
            style={[
              styles.footerLabel,
              screenMode === 'manage' && styles.footerLabelSelected,
            ]}
          >
            Gerir
          </Text>
        </Pressable>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  categoryButton: {
    alignItems: 'center',
    height: 83,
    justifyContent: 'flex-end',
    minWidth: 60,
  },
  categoryCarousel: {
    backgroundColor: colors.background,
    borderBottomColor: colors.placeholder,
    borderBottomWidth: 1,
    height: 90,
  },
  categoryContent: {
    alignItems: 'flex-end',
    columnGap: 16,
    paddingHorizontal: 6,
    paddingBottom: 6,
  },
  categoryIconBox: {
    alignItems: 'center',
    height: 60,
    justifyContent: 'flex-end',
    width: 60,
  },
  categoryLabel: {
    fontFamily: typography.family.semiBold,
    fontSize: 9,
    lineHeight: 10,
    marginBottom: 6,
    marginTop: 5,
    textAlign: 'center',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
  },
  draggingCard: {
    elevation: 8,
    opacity: 0.96,
    zIndex: 10,
  },
  footer: {
    alignItems: 'center',
    backgroundColor: colors.header,
    bottom: 0,
    flexDirection: 'row',
    height: FOOTER_HEIGHT,
    justifyContent: 'space-around',
    left: 0,
    position: 'absolute',
    right: 0,
  },
  footerButton: {
    alignItems: 'center',
    flex: 1,
    gap: 5,
    height: 60,
    justifyContent: 'center',
  },
  footerLabel: {
    color: colors.surface,
    fontFamily: typography.family.interRegular,
    fontSize: 10,
    lineHeight: 14,
    minWidth: 48,
    textAlign: 'center',
  },
  footerLabelSelected: {
    color: colors.selected,
    fontFamily: typography.family.interSemiBold,
  },
  listContent: {
    padding: LIST_HORIZONTAL_PADDING,
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
    height: 16,
  },
  topSection: {
    backgroundColor: colors.header,
    height: HEADER_HEIGHT,
  },
});
