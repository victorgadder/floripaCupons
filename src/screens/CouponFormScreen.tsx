import { Alert, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCouponForm } from '../hooks/useCouponForm';
import { useCouponStore } from '../store/couponStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { CouponFormScreenProps } from '../types/navigation';

export const CouponFormScreen = ({ navigation, route }: CouponFormScreenProps) => {
  const couponId = route.params?.couponId;
  const coupon = useCouponStore((state) =>
    couponId ? state.getCouponById(couponId) : undefined,
  );
  const addCoupon = useCouponStore((state) => state.addCoupon);
  const updateCoupon = useCouponStore((state) => state.updateCoupon);
  const insets = useSafeAreaInsets();

  const form = useCouponForm({
    description: coupon?.description ?? '',
    title: coupon?.title ?? '',
  });

  const handleSubmit = () => {
    const result = form.validate();

    if (!result.ok) {
      return;
    }

    if (couponId) {
      updateCoupon(couponId, result.data);
    } else {
      addCoupon(result.data);
    }

    navigation.goBack();
  };

  if (couponId && !coupon) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Cupom nao encontrado.</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingBottom: insets.bottom + spacing.lg }]}>
      <Text style={styles.label}>Titulo *</Text>
      <TextInput
        autoCapitalize="sentences"
        onChangeText={(value) => form.updateField('title', value)}
        placeholder="Ex.: Burger artesanal em dobro"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, form.titleError && styles.inputError]}
        value={form.values.title}
      />
      {form.titleError ? <Text style={styles.error}>{form.titleError}</Text> : null}

      <Text style={styles.label}>Descricao</Text>
      <TextInput
        multiline
        onChangeText={(value) => form.updateField('description', value)}
        placeholder="Descreva as regras principais do cupom"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, styles.textArea]}
        textAlignVertical="top"
        value={form.values.description}
      />

      <Pressable
        accessibilityRole="button"
        onPress={handleSubmit}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>
          {couponId ? 'Salvar cupom' : 'Criar cupom'}
        </Text>
      </Pressable>

      {form.isDirty ? null : (
        <Pressable
          onPress={() =>
            Alert.alert('Sem alteracoes', 'Edite algum campo antes de salvar.')
          }
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>Formulario sem alteracoes</Text>
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.primary,
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  buttonPressed: {
    backgroundColor: colors.primaryDark,
  },
  buttonText: {
    color: colors.surface,
    fontSize: typography.body,
    fontWeight: '800',
  },
  container: {
    backgroundColor: colors.background,
    flex: 1,
    padding: spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.text,
    fontSize: typography.subtitle,
    fontWeight: '800',
    marginBottom: spacing.md,
  },
  error: {
    color: colors.primary,
    fontSize: typography.caption,
    fontWeight: '700',
    marginTop: spacing.xs,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.text,
    fontSize: typography.body,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: {
    borderColor: colors.primary,
  },
  label: {
    color: colors.text,
    fontSize: typography.body,
    fontWeight: '800',
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  secondaryButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  secondaryButtonText: {
    color: colors.textMuted,
    fontSize: typography.body,
    fontWeight: '700',
  },
  textArea: {
    minHeight: 132,
  },
});
