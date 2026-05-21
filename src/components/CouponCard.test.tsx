import { fireEvent, render } from '@testing-library/react-native';

import { CouponCard } from './CouponCard';
import type { Coupon } from '../types/coupon';

const coupon: Coupon = {
  bonus: false,
  close: '23:00',
  description: 'Na compra de **um rodizio** ganhe outro.',
  id: 'coupon-1',
  opening: '18:00',
  title: 'Parma Pizza',
};

describe('CouponCard', () => {
  it('aciona a edição quando o usuário toca no card', () => {
    const handlePress = jest.fn();

    const { getByText } = render(
      <CouponCard
        coupon={coupon}
        mode="coupons"
        onDelete={jest.fn()}
        onEdit={jest.fn()}
        onPress={handlePress}
      />,
    );

    fireEvent.press(getByText('Parma Pizza'));

    expect(handlePress).toHaveBeenCalledTimes(1);
  });

  it('favorita o card sem disparar o toque do card', () => {
    const handlePress = jest.fn();

    const { getByLabelText } = render(
      <CouponCard
        coupon={coupon}
        mode="coupons"
        onDelete={jest.fn()}
        onEdit={jest.fn()}
        onPress={handlePress}
      />,
    );
    const favoriteButton = getByLabelText('Favoritar card');

    expect(favoriteButton.props.accessibilityState).toEqual({
      selected: false,
    });

    fireEvent.press(favoriteButton, { stopPropagation: jest.fn() });

    expect(handlePress).not.toHaveBeenCalled();
    expect(getByLabelText('Favoritar card').props.accessibilityState).toEqual({
      selected: true,
    });
  });
});
