import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import BonusIcon from '../../assets/icons/bonus.svg';
import HeartIcon from '../../assets/icons/heart.svg';
import { colors } from '../theme/colors';
import { typography } from '../theme/typography';
import type { Coupon } from '../types/coupon';

type CouponCardProps = {
  coupon: Coupon;
  onPress: () => void;
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
  const openingTotal = openingHours * 60 + openingMinutes;
  const closeTotal = closeHours * 60 + closeMinutes;
  const isOpen =
    openingTotal <= closeTotal
      ? currentMinutes >= openingTotal && currentMinutes <= closeTotal
      : currentMinutes >= openingTotal || currentMinutes <= closeTotal;

  return isOpen ? 'Aberto' : 'Fechado';
};

export const CouponCard = ({ coupon, onPress }: CouponCardProps) => (
  <Pressable
    accessibilityRole="button"
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
      <HeartIcon color={colors.surface} height={28} style={styles.heart} width={28} />
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
      <Text style={styles.status}>{getOpeningStatus(coupon)}</Text>
    </View>
  </Pressable>
);

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
    height: 156,
    overflow: 'hidden',
    position: 'relative',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingLeft: 12,
    paddingRight: 14,
    paddingTop: 24,
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
  imageArea: {
    height: 156,
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
    borderRadius: 22,
    height: 44,
    justifyContent: 'center',
    left: 166,
    overflow: 'hidden',
    position: 'absolute',
    top: 20,
    width: 44,
    zIndex: 2,
  },
  mealImage: {
    height: 156,
    resizeMode: 'cover',
    width: 184,
  },
  mealPlaceholder: {
    alignItems: 'center',
    backgroundColor: '#FFE3E4',
    height: 156,
    justifyContent: 'center',
    width: 184,
  },
  mealPlaceholderText: {
    color: colors.primary,
    fontFamily: typography.family.bold,
    fontSize: 12,
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.8,
  },
  restaurant: {
    color: colors.surface,
    fontFamily: typography.family.bold,
    fontSize: 14,
    lineHeight: 18,
    paddingRight: 36,
  },
  restaurantLogo: {
    height: 44,
    resizeMode: 'cover',
    width: 44,
  },
  status: {
    alignSelf: 'flex-end',
    backgroundColor: colors.placeholder,
    borderRadius: 8,
    color: colors.surface,
    fontFamily: typography.family.bold,
    fontSize: 9,
    lineHeight: 12,
    marginTop: 12,
    minWidth: 68,
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 3,
    textAlign: 'center',
  },
});
