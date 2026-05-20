import type { NativeStackScreenProps } from '@react-navigation/native-stack';

import type { CouponId } from './coupon';

export type RootStackParamList = {
  CouponList: undefined;
  CouponForm:
    | {
        couponId?: CouponId;
      }
    | undefined;
};

export type CouponListScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CouponList'
>;

export type CouponFormScreenProps = NativeStackScreenProps<
  RootStackParamList,
  'CouponForm'
>;
