import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockedCoupons } from '../mocks/coupons';
import type { Coupon, CouponFormInput, CouponId } from '../types/coupon';

type CouponState = {
  coupons: Coupon[];
  addCoupon: (input: CouponFormInput) => void;
  deleteCoupon: (couponId: CouponId) => void;
  getCouponById: (couponId: CouponId) => Coupon | undefined;
  reorderCoupons: (coupons: Coupon[]) => void;
  updateCoupon: (couponId: CouponId, input: CouponFormInput) => void;
};

const normalizeCouponInput = (input: CouponFormInput): CouponFormInput => ({
  bonus: input.bonus,
  mealImage: input.mealImage,
  restaurantLogo: input.restaurantLogo,
  restaurant: input.restaurant.trim(),
  restaurantURL: input.restaurantURL?.trim() || undefined,
  description: input.description.trim(),
  opening: input.opening.trim(),
  close: input.close.trim(),
});

const createCoupon = (input: CouponFormInput): Coupon => ({
  id: `coupon-${Date.now()}`,
  ...normalizeCouponInput(input),
});

export const useCouponStore = create<CouponState>()(
  persist(
    (set, get) => ({
      coupons: mockedCoupons,
      addCoupon: (input) => {
        set((state) => ({
          coupons: [createCoupon(input), ...state.coupons],
        }));
      },
      deleteCoupon: (couponId) => {
        set((state) => ({
          coupons: state.coupons.filter((coupon) => coupon.id !== couponId),
        }));
      },
      getCouponById: (couponId) =>
        get().coupons.find((coupon) => coupon.id === couponId),
      reorderCoupons: (coupons) => {
        set({ coupons });
      },
      updateCoupon: (couponId, input) => {
        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === couponId
              ? {
                  ...coupon,
                  ...normalizeCouponInput(input),
                }
              : coupon,
          ),
        }));
      },
    }),
    {
      name: 'floripa-cupons:coupon-cards',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
