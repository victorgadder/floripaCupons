import type { ImageRequireSource } from 'react-native';

export type CouponId = string;

export type RemoteCouponImage = {
  uri: string;
};

export type CouponImage = RemoteCouponImage | ImageRequireSource;

export type Coupon = {
  id: CouponId;
  bonus: boolean;
  mealImage?: CouponImage;
  restaurantLogo?: CouponImage;
  title: string;
  description: string;
  opening: string;
  close: string;
};

export type CouponFormInput = {
  bonus: boolean;
  mealImage?: CouponImage;
  restaurantLogo?: CouponImage;
  title: string;
  description: string;
  opening: string;
  close: string;
};
