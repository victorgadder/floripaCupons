import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCouponForm } from '../hooks/useCouponForm';
import { useCouponStore } from '../store/couponStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { CouponFormInput } from '../types/coupon';
import type { CouponFormScreenProps } from '../types/navigation';

const pickImage = async () => {
  const documentResult = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple: false,
    type: ['image/png', 'image/jpeg', 'image/*'],
  });

  if (!documentResult.canceled) {
    return {
      uri: documentResult.assets[0]?.uri ?? '',
    };
  }

  return undefined;
};

const pickImageFromLibrary = async () => {
  const result = await ImagePicker.launchImageLibraryAsync({
    allowsEditing: true,
    mediaTypes: ['images'],
    quality: 0.85,
  });

  if (result.canceled) {
    return undefined;
  }

  return {
    uri: result.assets[0]?.uri ?? '',
  };
};

const initialFormValues: CouponFormInput = {
  bonus: false,
  close: '23:00',
  description: '',
  opening: '18:00',
  restaurant: '',
  restaurantURL: '',
};

export const CouponFormScreen = ({ navigation, route }: CouponFormScreenProps) => {
  const couponId = route.params?.couponId;
  const coupon = useCouponStore((state) =>
    couponId ? state.getCouponById(couponId) : undefined,
  );
  const addCoupon = useCouponStore((state) => state.addCoupon);
  const deleteCoupon = useCouponStore((state) => state.deleteCoupon);
  const updateCoupon = useCouponStore((state) => state.updateCoupon);
  const insets = useSafeAreaInsets();

  const form = useCouponForm(
    coupon
      ? {
          bonus: coupon.bonus,
          close: coupon.close,
          description: coupon.description,
          mealImage: coupon.mealImage,
          opening: coupon.opening,
          restaurant: coupon.restaurant,
          restaurantLogo: coupon.restaurantLogo,
          restaurantURL: coupon.restaurantURL ?? '',
        }
      : initialFormValues,
  );

  const handleImagePick = async (
    field: 'mealImage' | 'restaurantLogo',
    source: 'documents' | 'gallery' = 'documents',
  ) => {
    const image =
      source === 'documents' ? await pickImage() : await pickImageFromLibrary();

    if (image?.uri) {
      form.updateField(field, image);
    }
  };

  const applyDescriptionFormat = (format: 'bold' | 'italic') => {
    const marker = format === 'bold' ? '**' : '*';
    const currentDescription = form.values.description.trim();
    const nextDescription = currentDescription
      ? `${form.values.description}${marker}texto${marker}`
      : `${marker}texto${marker}`;

    form.updateField('description', nextDescription);
  };

  const handleDelete = () => {
    if (!couponId) {
      return;
    }

    Alert.alert('Excluir cupom', 'Deseja excluir este card?', [
      { style: 'cancel', text: 'Cancelar' },
      {
        onPress: () => {
          deleteCoupon(couponId);
          navigation.goBack();
        },
        style: 'destructive',
        text: 'Excluir',
      },
    ]);
  };

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
    <ScrollView
      contentContainerStyle={[
        styles.container,
        { paddingBottom: insets.bottom + spacing.xl },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.label}>Imagem do prato</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => handleImagePick('mealImage')}
        style={styles.imagePicker}
      >
        {form.values.mealImage ? (
          <Image source={{ uri: form.values.mealImage.uri }} style={styles.mealPreview} />
        ) : (
          <Text style={styles.imagePickerText}>Selecionar PNG do prato</Text>
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => handleImagePick('mealImage', 'gallery')}
        style={styles.galleryButton}
      >
        <Text style={styles.galleryButtonText}>Escolher pela galeria</Text>
      </Pressable>

      <Pressable
        accessibilityRole="checkbox"
        accessibilityState={{ checked: form.values.bonus }}
        onPress={() => form.updateField('bonus', !form.values.bonus)}
        style={styles.checkboxRow}
      >
        <View style={[styles.checkbox, form.values.bonus && styles.checkboxChecked]}>
          {form.values.bonus ? <Text style={styles.checkboxMark}>✓</Text> : null}
        </View>
        <Text style={styles.checkboxLabel}>Adicionar promoção</Text>
      </Pressable>

      <Text style={styles.label}>Logomarca do restaurante</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => handleImagePick('restaurantLogo')}
        style={[styles.imagePicker, styles.logoPicker]}
      >
        {form.values.restaurantLogo ? (
          <Image
            source={{ uri: form.values.restaurantLogo.uri }}
            style={styles.logoPreview}
          />
        ) : (
          <Text style={styles.imagePickerText}>Selecionar PNG da logo</Text>
        )}
      </Pressable>
      <Pressable
        accessibilityRole="button"
        onPress={() => handleImagePick('restaurantLogo', 'gallery')}
        style={styles.galleryButton}
      >
        <Text style={styles.galleryButtonText}>Escolher pela galeria</Text>
      </Pressable>

      <Text style={styles.label}>Restaurante *</Text>
      <TextInput
        autoCapitalize="words"
        onChangeText={(value) => form.updateField('restaurant', value)}
        placeholder="Ex.: Parma Pizza"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, form.errors.restaurant && styles.inputError]}
        value={form.values.restaurant}
      />
      {form.errors.restaurant ? (
        <Text style={styles.error}>{form.errors.restaurant}</Text>
      ) : null}

      <Text style={styles.label}>URL do restaurante</Text>
      <TextInput
        autoCapitalize="none"
        keyboardType="url"
        onChangeText={(value) => form.updateField('restaurantURL', value)}
        placeholder="https://restaurante.com.br"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, form.errors.restaurantURL && styles.inputError]}
        value={form.values.restaurantURL}
      />
      {form.errors.restaurantURL ? (
        <Text style={styles.error}>{form.errors.restaurantURL}</Text>
      ) : null}

      <Text style={styles.label}>Promoção *</Text>
      <View style={styles.formatToolbar}>
        <Pressable
          onPress={() => applyDescriptionFormat('bold')}
          style={styles.formatButton}
        >
          <Text style={styles.formatBold}>B</Text>
        </Pressable>
        <Pressable
          onPress={() => applyDescriptionFormat('italic')}
          style={styles.formatButton}
        >
          <Text style={styles.formatItalic}>I</Text>
        </Pressable>
      </View>
      <TextInput
        multiline
        onChangeText={(value) => form.updateField('description', value)}
        placeholder="Ex.: Na compra de **um rodizio** ganhe outro igual."
        placeholderTextColor={colors.textMuted}
        style={[styles.input, styles.textArea, form.errors.description && styles.inputError]}
        textAlignVertical="top"
        value={form.values.description}
      />
      {form.errors.description ? (
        <Text style={styles.error}>{form.errors.description}</Text>
      ) : null}

      <View style={styles.timeRow}>
        <View style={styles.timeField}>
          <Text style={styles.label}>Abertura *</Text>
          <TextInput
            keyboardType="numbers-and-punctuation"
            onChangeText={(value) => form.updateField('opening', value)}
            placeholder="18:00"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, form.errors.opening && styles.inputError]}
            value={form.values.opening}
          />
          {form.errors.opening ? (
            <Text style={styles.error}>{form.errors.opening}</Text>
          ) : null}
        </View>

        <View style={styles.timeField}>
          <Text style={styles.label}>Fechamento *</Text>
          <TextInput
            keyboardType="numbers-and-punctuation"
            onChangeText={(value) => form.updateField('close', value)}
            placeholder="23:00"
            placeholderTextColor={colors.textMuted}
            style={[styles.input, form.errors.close && styles.inputError]}
            value={form.values.close}
          />
          {form.errors.close ? (
            <Text style={styles.error}>{form.errors.close}</Text>
          ) : null}
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={handleSubmit}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
      >
        <Text style={styles.buttonText}>
          {couponId ? 'Salvar card' : 'Criar card'}
        </Text>
      </Pressable>

      {couponId ? (
        <Pressable onPress={handleDelete} style={styles.deleteButton}>
          <Text style={styles.deleteButtonText}>Excluir card</Text>
        </Pressable>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.login,
    borderRadius: 10,
    height: 52,
    justifyContent: 'center',
    marginTop: spacing.lg,
  },
  buttonPressed: {
    opacity: 0.8,
  },
  buttonText: {
    color: colors.surface,
    fontFamily: typography.family.bold,
    fontSize: typography.body,
  },
  checkbox: {
    alignItems: 'center',
    borderColor: colors.placeholder,
    borderRadius: 4,
    borderWidth: 1,
    height: 22,
    justifyContent: 'center',
    width: 22,
  },
  checkboxChecked: {
    backgroundColor: colors.login,
    borderColor: colors.login,
  },
  checkboxLabel: {
    color: colors.surface,
    fontFamily: typography.family.semiBold,
    fontSize: typography.body,
  },
  checkboxMark: {
    color: colors.surface,
    fontFamily: typography.family.bold,
    fontSize: 14,
    lineHeight: 18,
  },
  checkboxRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.md,
  },
  container: {
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  deleteButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  deleteButtonText: {
    color: colors.primary,
    fontFamily: typography.family.bold,
    fontSize: typography.body,
  },
  emptyState: {
    alignItems: 'center',
    backgroundColor: colors.background,
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
  },
  emptyTitle: {
    color: colors.surface,
    fontFamily: typography.family.bold,
    fontSize: typography.subtitle,
    marginBottom: spacing.md,
  },
  error: {
    color: colors.login,
    fontFamily: typography.family.semiBold,
    fontSize: typography.caption,
    marginTop: spacing.xs,
  },
  formatBold: {
    color: colors.surface,
    fontFamily: typography.family.bold,
    fontSize: typography.body,
  },
  formatButton: {
    alignItems: 'center',
    backgroundColor: colors.header,
    borderColor: colors.placeholder,
    borderRadius: 8,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 42,
  },
  formatItalic: {
    color: colors.surface,
    fontFamily: typography.family.semiBold,
    fontSize: typography.body,
    fontStyle: 'italic',
  },
  formatToolbar: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  galleryButton: {
    alignSelf: 'flex-start',
    paddingVertical: spacing.sm,
  },
  galleryButtonText: {
    color: colors.login,
    fontFamily: typography.family.semiBold,
    fontSize: typography.caption,
  },
  imagePicker: {
    alignItems: 'center',
    backgroundColor: colors.header,
    borderColor: colors.placeholder,
    borderRadius: 10,
    borderWidth: 1,
    height: 124,
    justifyContent: 'center',
    overflow: 'hidden',
  },
  imagePickerText: {
    color: colors.surface,
    fontFamily: typography.family.semiBold,
    fontSize: typography.body,
  },
  input: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    color: colors.text,
    fontFamily: typography.family.regular,
    fontSize: typography.body,
    minHeight: 48,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  inputError: {
    borderColor: colors.login,
  },
  label: {
    color: colors.surface,
    fontFamily: typography.family.bold,
    fontSize: typography.body,
    marginBottom: spacing.sm,
    marginTop: spacing.md,
  },
  logoPicker: {
    alignSelf: 'flex-start',
    borderRadius: 54,
    height: 108,
    width: 108,
  },
  logoPreview: {
    height: 108,
    resizeMode: 'cover',
    width: 108,
  },
  mealPreview: {
    height: 124,
    resizeMode: 'cover',
    width: '100%',
  },
  secondaryButton: {
    alignItems: 'center',
    padding: spacing.md,
  },
  secondaryButtonText: {
    color: colors.surface,
    fontFamily: typography.family.bold,
    fontSize: typography.body,
  },
  textArea: {
    minHeight: 132,
  },
  timeField: {
    flex: 1,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
