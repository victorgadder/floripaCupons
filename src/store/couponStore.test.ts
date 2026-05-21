import AsyncStorage from '@react-native-async-storage/async-storage';

import { useCouponStore } from './couponStore';
import type { Coupon, CouponFormInput } from '../types/coupon';

const createFormInput = (
  overrides: Partial<CouponFormInput> = {},
): CouponFormInput => ({
  bonus: false,
  close: '22:00',
  description: 'Promoção da casa',
  opening: '10:00',
  title: 'Meu restaurante',
  ...overrides,
});

const createCoupon = (overrides: Partial<Coupon> = {}): Coupon => ({
  bonus: false,
  close: '22:00',
  description: 'Descrição inicial',
  id: 'coupon-1',
  opening: '10:00',
  title: 'Card inicial',
  ...overrides,
});

describe('couponStore', () => {
  beforeEach(() => {
    jest.spyOn(Date, 'now').mockReturnValue(123456);
    useCouponStore.setState({ coupons: [] });
    void AsyncStorage.clear();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('adiciona um cupom no início da lista normalizando textos', () => {
    useCouponStore.getState().addCoupon(
      createFormInput({
        description: '  Ganhe outro prato  ',
        title: '  Parma Pizza  ',
      }),
    );

    expect(useCouponStore.getState().coupons).toEqual([
      expect.objectContaining({
        close: '22:00',
        description: 'Ganhe outro prato',
        id: 'coupon-123456',
        opening: '10:00',
        title: 'Parma Pizza',
      }),
    ]);
  });

  it('atualiza apenas o cupom selecionado', () => {
    const unchangedCoupon = createCoupon({
      id: 'coupon-2',
      title: 'Outro card',
    });

    useCouponStore.setState({
      coupons: [createCoupon(), unchangedCoupon],
    });

    useCouponStore.getState().updateCoupon(
      'coupon-1',
      createFormInput({
        bonus: true,
        close: '23:30',
        description: '  Nova promoção  ',
        opening: '18:00',
        title: '  Novo título  ',
      }),
    );

    expect(useCouponStore.getState().coupons).toEqual([
      expect.objectContaining({
        bonus: true,
        close: '23:30',
        description: 'Nova promoção',
        id: 'coupon-1',
        opening: '18:00',
        title: 'Novo título',
      }),
      unchangedCoupon,
    ]);
  });

  it('remove um cupom pelo id', () => {
    useCouponStore.setState({
      coupons: [
        createCoupon({ id: 'coupon-1' }),
        createCoupon({ id: 'coupon-2' }),
      ],
    });

    useCouponStore.getState().deleteCoupon('coupon-1');

    expect(useCouponStore.getState().coupons).toEqual([
      expect.objectContaining({ id: 'coupon-2' }),
    ]);
  });

  it('reorganiza a lista respeitando a ordem recebida', () => {
    const firstCoupon = createCoupon({ id: 'coupon-1' });
    const secondCoupon = createCoupon({ id: 'coupon-2' });
    const thirdCoupon = createCoupon({ id: 'coupon-3' });

    useCouponStore.setState({
      coupons: [firstCoupon, secondCoupon, thirdCoupon],
    });

    useCouponStore
      .getState()
      .reorderCoupons([thirdCoupon, firstCoupon, secondCoupon]);

    expect(useCouponStore.getState().coupons.map((coupon) => coupon.id)).toEqual([
      'coupon-3',
      'coupon-1',
      'coupon-2',
    ]);
  });
});
