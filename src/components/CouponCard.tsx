import { useRef, useState } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import BonusIcon from '../../assets/icons/bonus.svg';
import CloseIcon from '../../assets/icons/close.svg';
import ConfigCupomIcon from '../../assets/icons/configCupom.svg';
import HeartIcon from '../../assets/icons/heart.svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { Coupon } from '../types/coupon';

type CouponCardProps = {
  coupon: Coupon;
  mode: 'coupons' | 'manage';
  onDelete: () => void;
  onEdit: () => void;
  onLongPress?: () => void;
  onPress?: () => void;
};

type DescriptionSegment = {
  text: string;
  bold?: boolean;
  italic?: boolean;
};

const parseDescription = (description: string): DescriptionSegment[] => {
  const segments: DescriptionSegment[] = [];
  const regex = /(\*\*[^*]+\*\*|\*[^*]+\*)/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(description))) {
    if (match.index > lastIndex) {
      segments.push({ text: description.slice(lastIndex, match.index) });
    }

    const token = match[0];
    const bold = token.startsWith('**');
    segments.push({
      bold,
      italic: !bold,
      text: bold ? token.slice(2, -2) : token.slice(1, -1),
    });

    lastIndex = regex.lastIndex;
  }

  if (lastIndex < description.length) {
    segments.push({ text: description.slice(lastIndex) });
  }

  return segments;
};

const getOpeningStatus = ({ close, opening }: Pick<Coupon, 'close' | 'opening'>) => {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const [openingHours, openingMinutes] = opening.split(':').map(Number);
  const [closeHours, closeMinutes] = close.split(':').map(Number);

  if (
    [openingHours, openingMinutes, closeHours, closeMinutes].some(Number.isNaN)
  ) {
    return {
      backgroundColor: colors.placeholder,
      label: 'Fechado',
    };
  }

  const openingTotal = openingHours * 60 + openingMinutes;
  const closeTotal = closeHours * 60 + closeMinutes;
  const isOpen =
    openingTotal <= closeTotal
      ? currentMinutes >= openingTotal && currentMinutes <= closeTotal
      : currentMinutes >= openingTotal || currentMinutes <= closeTotal;

  return {
    backgroundColor: isOpen ? colors.open : colors.placeholder,
    label: isOpen ? 'Aberto agora' : 'Fechado',
  };
};

export const CouponCard = ({
  coupon,
  mode,
  onDelete,
  onEdit,
  onLongPress,
  onPress,
}: CouponCardProps) => {
  const openingStatus = getOpeningStatus(coupon);
  const [isFavorite, setIsFavorite] = useState(false);
  const heartScale = useRef(new Animated.Value(1)).current;

  const handleFavoritePress = () => {
    setIsFavorite((currentValue) => !currentValue);
    Animated.sequence([
      Animated.timing(heartScale, {
        duration: 120,
        toValue: 1.22,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        friction: 4,
        tension: 120,
        toValue: 1,
        useNativeDriver: true,
      }),
    ]).start();
  };

  return (
    <Pressable
      accessibilityRole="button"
      disabled={!onPress && !onLongPress}
      onLongPress={onLongPress}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
    >
      <View style={styles.imageArea}>
        {coupon.mealImage ? (
          <Image source={{ uri: coupon.mealImage.uri }} style={styles.mealImage} />
        ) : (
          <View style={styles.mealPlaceholder}>
            <Text style={styles.mealPlaceholderText}>Imagem do prato</Text>
          </View>
        )}
        {coupon.bonus ? (
          <BonusIcon height={64} style={styles.bonusIcon} width={102} />
        ) : null}
      </View>

      <View style={styles.logoWrapper}>
        {coupon.restaurantLogo ? (
          <Image
            source={{ uri: coupon.restaurantLogo.uri }}
            style={styles.restaurantLogo}
          />
        ) : (
          <Text style={styles.logoFallback}>
            {coupon.restaurant.slice(0, 2).toUpperCase()}
          </Text>
        )}
      </View>

      <View style={styles.content}>
        {mode === 'manage' ? (
          <View style={styles.manageActions}>
            <Pressable
              accessibilityLabel="Editar card"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onEdit}
              style={styles.actionButton}
            >
              <ConfigCupomIcon color={colors.surface} height={24} width={24} />
            </Pressable>
            <Pressable
              accessibilityLabel="Excluir card"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onDelete}
              style={styles.actionButton}
            >
              <CloseIcon color={colors.surface} height={24} width={24} />
            </Pressable>
          </View>
        ) : (
          <Pressable
            accessibilityLabel="Favoritar card"
            accessibilityRole="button"
            hitSlop={8}
            onPress={handleFavoritePress}
            style={styles.heartButton}
          >
            <Animated.View style={{ transform: [{ scale: heartScale }] }}>
              {isFavorite ? (
                <Svg
                  height={28}
                  style={styles.heartFill}
                  viewBox="0 0 26 23"
                  width={28}
                >
                  <Path
                    d="M13 22C8.9 18.85 5.9 16.05 3.8 13.22C1.35 9.93 0.8 6.98 2.05 4.45C2.92 2.7 5.48 1.27 8.45 2.12C10.08 2.58 11.45 3.62 12.34 5.03C12.49 5.27 12.74 5.42 13 5.42C13.26 5.42 13.51 5.27 13.66 5.03C14.55 3.62 15.92 2.58 17.55 2.12C20.52 1.27 23.08 2.7 23.95 4.45C25.2 6.98 24.65 9.93 22.2 13.22C20.1 16.05 17.1 18.85 13 22Z"
                    fill="#e2d3fc"
                  />
                </Svg>
              ) : null}
              <HeartIcon
                color={colors.surface}
                height={28}
                width={28}
              />
            </Animated.View>
          </Pressable>
        )}
        <Text numberOfLines={1} style={styles.restaurant}>
          {coupon.restaurant}
        </Text>
        <Text numberOfLines={3} style={styles.description}>
          {parseDescription(coupon.description).map((segment, index) => (
            <Text
              key={`${segment.text}-${index}`}
              style={[
                segment.bold && styles.boldDescription,
                segment.italic && styles.italicDescription,
              ]}
            >
              {segment.text}
            </Text>
          ))}
        </Text>
        <Text
          style={[
            styles.status,
            { backgroundColor: openingStatus.backgroundColor },
          ]}
        >
          {openingStatus.label}
        </Text>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  boldDescription: {
    fontFamily: typography.family.bold,
  },
  bonusIcon: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
  card: {
    backgroundColor: colors.header,
    borderColor: colors.placeholder,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    height: 159,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingBottom: 30,
    paddingLeft: 18,
    paddingRight: 14,
    paddingTop: 56,
  },
  description: {
    color: colors.surface,
    fontFamily: typography.family.regular,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 6,
  },
  heart: {
    position: 'absolute',
    right: 13,
    top: 12,
  },
  heartButton: {
    position: 'absolute',
    right: 13,
    top: 12,
    zIndex: 3,
  },
  heartFill: {
    left: 0,
    position: 'absolute',
    top: 0,
  },
  imageArea: {
    height: 159,
    overflow: 'hidden',
    width: 184,
  },
  italicDescription: {
    fontStyle: 'italic',
  },
  logoFallback: {
    color: colors.primary,
    fontFamily: typography.family.bold,
    fontSize: 10,
  },
  logoWrapper: {
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 24,
    height: 48,
    justifyContent: 'center',
    left: 160,
    overflow: 'hidden',
    position: 'absolute',
    top: 12,
    width: 48,
    zIndex: 2,
  },
  mealImage: {
    height: 159,
    resizeMode: 'cover',
    width: 184,
  },
  mealPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#FFE3E4',
    height: 159,
    justifyContent: 'center',
    width: 184,
  },
  mealPlaceholderText: {
    color: colors.primary,
    fontFamily: typography.family.bold,
    fontSize: 12,
    textAlign: 'center',
  },
  actionButton: {
    alignItems: 'center',
    height: 28,
    justifyContent: 'center',
    width: 28,
  },
  manageActions: {
    columnGap: 8,
    flexDirection: 'row',
    position: 'absolute',
    right: 10,
    top: 12,
    zIndex: 3,
  },
  pressed: {
    opacity: 0.8,
  },
  restaurant: {
    color: colors.surface,
    fontFamily: typography.family.bold,
    fontSize: 14,
    lineHeight: 18,
    paddingRight: 34,
  },
  restaurantLogo: {
    height: 48,
    resizeMode: 'cover',
    width: 48,
  },
  status: {
    alignSelf: 'flex-end',
    borderRadius: 8,
    bottom: 9,
    color: colors.surface,
    fontFamily: typography.family.bold,
    fontSize: 9,
    lineHeight: 12,
    minWidth: 68,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 3,
    position: 'absolute',
    right: 12,
    textAlign: 'center',
  },
});
