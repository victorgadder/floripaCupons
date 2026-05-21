import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { CouponFormScreen } from '../screens/CouponFormScreen';
import { CouponListScreen } from '../screens/CouponListScreen';
import { colors } from '../theme/colors';
import type { RootStackParamList } from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator
      screenOptions={{
        contentStyle: { backgroundColor: colors.background },
        headerShadowVisible: false,
        headerTintColor: colors.text,
        headerTitleStyle: {
          fontWeight: '800',
        },
      }}
    >
      <Stack.Screen
        component={CouponListScreen}
        name="CouponList"
        options={{ headerShown: false }}
      />
      <Stack.Screen
        component={CouponFormScreen}
        name="CouponForm"
        options={({ route }) => ({
          title: route.params?.couponId ? 'Editar card' : 'Configurar novo card',
        })}
      />
    </Stack.Navigator>
  </NavigationContainer>
);
