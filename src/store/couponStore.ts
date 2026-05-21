import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { mockedCoupons } from '../mocks/coupons';
import type { Coupon, CouponFormInput, CouponId } from '../types/coupon';

type PersistedCoupon = Coupon & {
  restaurant?: string;
};

export type CouponState = {
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
  title: input.title.trim(),
  description: input.description.trim(),
  opening: input.opening.trim(),
  close: input.close.trim(),
});

const createCoupon = (input: CouponFormInput): Coupon => ({
  id: `coupon-${Date.now()}`,
  ...normalizeCouponInput(input),
});

const isPersistedCoupon = (coupon: unknown): coupon is PersistedCoupon =>
  typeof coupon === 'object' && coupon !== null && 'id' in coupon;

const isPersistedCouponState = (
  state: unknown,
): state is Partial<CouponState> & { coupons?: unknown[] } =>
  typeof state === 'object' && state !== null;

const normalizePersistedCoupon = (coupon: PersistedCoupon): Coupon => {
  const { restaurant, ...currentCoupon } = coupon;
  const mockedCoupon = mockedCoupons.find(
    (mockedItem) => mockedItem.id === currentCoupon.id,
  );

  return {
    ...currentCoupon,
    mealImage: currentCoupon.mealImage ?? mockedCoupon?.mealImage,
    restaurantLogo: currentCoupon.restaurantLogo ?? mockedCoupon?.restaurantLogo,
    title: coupon.title || restaurant || '',
  };
};

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
      merge: (persistedState, currentState) => {
        const nextState = isPersistedCouponState(persistedState)
          ? persistedState
          : undefined;
        const persistedCoupons = nextState?.coupons?.filter(isPersistedCoupon);

        return {
          ...currentState,
          ...nextState,
          coupons:
            persistedCoupons?.map(normalizePersistedCoupon) ??
            currentState.coupons,
        };
      },
      name: 'floripa-cupons:coupon-cards',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
