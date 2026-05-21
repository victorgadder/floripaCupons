import type { Coupon } from '../types/coupon';

export const mockedCoupons: Coupon[] = [
  {
    bonus: true,
    close: '23:00',
    description:
      'Na compra de **um rodizio** ganhe outro igual ou de menor valor.',
    id: 'coupon-1',
    mealImage: require('../../assets/parmaPizzaMeal.png'),
    opening: '18:00',
    restaurantLogo: require('../../assets/parma-pizza-logo-clean.png'),
    title: 'Parma Pizza',
  },
  {
    bonus: true,
    close: '15:00',
    description:
      'Na compra de **uma sequencia completa de galeto na brasa** ganhe outra.',
    id: 'coupon-2',
    mealImage: require('../../assets/galeto-na-brasa.jpg'),
    opening: '11:30',
    restaurantLogo: require('../../assets/galeto-logo.jpg'),
    title: 'Bosco Galeto na Brasa',
  },
  {
    bonus: false,
    close: '23:30',
    description:
      'Na compra de **um combinado especial**, o segundo sai por conta da casa.',
    id: 'coupon-3',
    mealImage: require('../../assets/reiDoSushiMeal.jpg'),
    opening: '18:30',
    restaurantLogo: require('../../assets/reidosushiLogo.png'),
    title: 'Nippo Sushi',
  },
];
