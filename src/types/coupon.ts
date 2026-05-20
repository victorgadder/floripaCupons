export type CouponId = string;

export type Coupon = {
  id: CouponId;
  title: string;
  description?: string;
  partnerName: string;
  category: string;
  distanceLabel: string;
  benefitLabel: string;
  expiresAtLabel: string;
  isFavorite: boolean;
};

export type CouponFormInput = {
  title: string;
  description?: string;
};
