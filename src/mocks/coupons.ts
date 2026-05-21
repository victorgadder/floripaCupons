import type { Coupon } from '../types/coupon';

export const mockedCoupons: Coupon[] = [
  {
    bonus: true,
    id: 'coupon-1',
    title: 'Parma Pizza',
    description:
      'Na compra de **um rodizio** ganhe outro igual ou de menor valor.',
    opening: '18:00',
    close: '23:00',
  },
  {
    bonus: true,
    id: 'coupon-2',
    title: 'Bosco Galeto na Brasa',
    description:
      'Na compra de **uma sequencia completa de galeto na brasa** ganhe outra.',
    opening: '11:30',
    close: '15:00',
  },
  {
    bonus: false,
    id: 'coupon-3',
    title: 'Nippo Sushi',
    description:
      'Na compra de **um combinado especial**, o segundo sai por conta da casa.',
    opening: '18:30',
    close: '23:30',
  },
];
