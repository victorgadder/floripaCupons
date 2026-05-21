export type CouponId = string;

export type CouponImage = {
  uri: string;
};

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
