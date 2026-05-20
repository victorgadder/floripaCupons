import type { Coupon } from '../types/coupon';

export const mockedCoupons: Coupon[] = [
  {
    id: 'coupon-1',
    title: 'Rodizio de sushi em dobro',
    description: 'Na compra de um rodizio, o segundo sai por conta da casa.',
    partnerName: 'Nippo Sushi',
    category: 'Gastronomia',
    distanceLabel: '1,2 km',
    benefitLabel: '2 por 1',
    expiresAtLabel: 'Expira em 12 dias',
    isFavorite: true,
  },
  {
    id: 'coupon-2',
    title: 'Cafe especial em dobro',
    description: 'Valido para espresso, cappuccino ou latte.',
    partnerName: 'Cafe da Lagoa',
    category: 'Cafeteria',
    distanceLabel: '2,8 km',
    benefitLabel: 'Compre 1 leve 2',
    expiresAtLabel: 'Expira em 5 dias',
    isFavorite: false,
  },
  {
    id: 'coupon-3',
    title: 'Burger artesanal em dobro',
    description: 'Escolha entre os burgers classicos da casa.',
    partnerName: 'Ilha Burger',
    category: 'Hamburgueria',
    distanceLabel: '4,1 km',
    benefitLabel: '2 por 1',
    expiresAtLabel: 'Expira em 20 dias',
    isFavorite: false,
  },
];
