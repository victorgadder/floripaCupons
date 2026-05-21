import { fireEvent, render } from '@testing-library/react-native';

import { CouponListScreen } from './CouponListScreen';
import { useCouponStore } from '../store/couponStore';
import type { Coupon } from '../types/coupon';
import type { CouponListScreenProps } from '../types/navigation';

const readyCoupon: Coupon = {
  bonus: false,
  close: '23:00',
  description: 'Promoção válida',
  id: 'coupon-ready',
  opening: '18:00',
  title: 'Cupom pronto',
};

const draftCoupon: Coupon = {
  bonus: false,
  close: '23:00',
  description: 'Rascunho sem título',
  id: 'coupon-draft',
  opening: '18:00',
  title: '',
};

type CouponListTestProps = {
  navigation: Pick<CouponListScreenProps['navigation'], 'navigate'>;
};

const createScreenProps = (): CouponListTestProps => ({
  navigation: {
    navigate: jest.fn(),
  },
});

describe('CouponListScreen', () => {
  beforeEach(() => {
    useCouponStore.setState({
      coupons: [draftCoupon, readyCoupon],
    });
  });

  it('exibe rascunhos sem título apenas na tela Gerir', () => {
    const props = createScreenProps();
    const { getByText, queryByText } = render(<CouponListScreen {...props} />);

    expect(getByText('Cupom pronto')).toBeTruthy();
    expect(queryByText('Sem título')).toBeNull();

    fireEvent.press(getByText('Gerir'));

    expect(getByText('Sem título')).toBeTruthy();
  });
});
