import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockedCoupons } from '../mocks/coupons';
import type { Coupon, CouponFormInput, CouponId } from '../types/coupon';

type CouponState = {
  coupons: Coupon[];
  addCoupon: (input: CouponFormInput) => void;
  updateCoupon: (couponId: CouponId, input: CouponFormInput) => void;
  getCouponById: (couponId: CouponId) => Coupon | undefined;
};

const createCoupon = (input: CouponFormInput): Coupon => ({
  id: `coupon-${Date.now()}`,
  title: input.title.trim(),
  description: input.description?.trim() || undefined,
  partnerName: 'Novo parceiro',
  category: 'Cupom local',
  distanceLabel: '0 km',
  benefitLabel: 'Novo',
  expiresAtLabel: 'Sem validade definida',
  isFavorite: false,
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
      updateCoupon: (couponId, input) => {
        set((state) => ({
          coupons: state.coupons.map((coupon) =>
            coupon.id === couponId
              ? {
                  ...coupon,
                  title: input.title.trim(),
                  description: input.description?.trim() || undefined,
                }
              : coupon,
          ),
        }));
      },
      getCouponById: (couponId) =>
        get().coupons.find((coupon) => coupon.id === couponId),
    }),
    {
      name: 'floripa-cupons:coupons',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
