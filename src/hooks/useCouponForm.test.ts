import { act, renderHook } from '@testing-library/react-native';

import { useCouponForm } from './useCouponForm';
import type { CouponFormInput } from '../types/coupon';

const validInitialValues: CouponFormInput = {
  bonus: false,
  close: '23:00',
  description: '',
  opening: '18:00',
  title: 'Parma Pizza',
};

describe('useCouponForm', () => {
  it('invalida o formulário quando o título obrigatório não foi preenchido', () => {
    const { result } = renderHook(() =>
      useCouponForm({
        ...validInitialValues,
        title: '   ',
      }),
    );
    let isValid = true;

    act(() => {
      isValid = result.current.validate().ok;
    });

    expect(isValid).toBe(false);
    expect(result.current.errors.title).toBe('Informe o título.');
  });

  it('mantém a descrição como campo opcional', () => {
    const { result } = renderHook(() =>
      useCouponForm({
        ...validInitialValues,
        description: '',
      }),
    );
    let isValid = false;

    act(() => {
      isValid = result.current.validate().ok;
    });

    expect(isValid).toBe(true);
    expect(result.current.errors.description).toBeUndefined();
  });
});
