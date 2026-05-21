import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import type { NavigationAction } from '@react-navigation/native';
import {
  Alert,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useEffect, useRef, useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useCouponForm } from '../hooks/useCouponForm';
import { useCouponStore } from '../store/couponStore';
import { colors } from '../theme/colors';
import { spacing } from '../theme/spacing';
import { typography } from '../theme/typography';
import type { CouponFormInput, RemoteCouponImage } from '../types/coupon';
import type { CouponFormScreenProps } from '../types/navigation';

const timeOptions: string[] = Array.from({ length: 48 }, (_, index) => {
  const hours = Math.floor(index / 2);
  const minutes = index % 2 === 0 ? '00' : '30';

  return `${String(hours).padStart(2, '0')}:${minutes}`;
});

const pickImage = async (): Promise<RemoteCouponImage | undefined> => {
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

const pickImageFromLibrary = async (): Promise<RemoteCouponImage | undefined> => {
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
  title: '',
};

type EditableField = 'title' | 'description';

const getMissingRequiredField = (values: CouponFormInput): string | null => {
  if (!values.title.trim()) {
    return 'Título';
  }

  return null;
};

export const CouponFormScreen = ({ navigation, route }: CouponFormScreenProps) => {
  const [timePickerField, setTimePickerField] = useState<
    'opening' | 'close' | null
  >(null);
  const couponId = route.params?.couponId;
  const coupon = useCouponStore((state) =>
    couponId ? state.getCouponById(couponId) : undefined,
  );
  const addCoupon = useCouponStore((state) => state.addCoupon);
  const deleteCoupon = useCouponStore((state) => state.deleteCoupon);
  const updateCoupon = useCouponStore((state) => state.updateCoupon);
  const insets = useSafeAreaInsets();
  const allowExitRef = useRef(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const titleInputRef = useRef<TextInput>(null);
  const descriptionInputRef = useRef<TextInput>(null);
  const [pendingNavigationAction, setPendingNavigationAction] =
    useState<NavigationAction | null>(null);
  const [descriptionSelection, setDescriptionSelection] = useState({
    end: 0,
    start: 0,
  });
  const [missingRequiredField, setMissingRequiredField] = useState<string | null>(
    null,
  );
  const [unsavedModalVisible, setUnsavedModalVisible] = useState(false);
  const [invalidDraftModalVisible, setInvalidDraftModalVisible] = useState(false);

  const form = useCouponForm(
    coupon
      ? {
          bonus: coupon.bonus,
          close: coupon.close,
          description: coupon.description,
          mealImage: coupon.mealImage,
          opening: coupon.opening,
          restaurantLogo: coupon.restaurantLogo,
          title: coupon.title,
      }
      : initialFormValues,
  );
  const [descriptionDraft, setDescriptionDraft] = useState(
    form.values.description,
  );
  const [descriptionInputKey, setDescriptionInputKey] = useState(0);

  useEffect(() => {
    const unsubscribe = navigation.addListener('beforeRemove', (event) => {
      if (!form.isDirty || allowExitRef.current) {
        return;
      }

      event.preventDefault();
      blurTextInputs();
      setPendingNavigationAction(event.data.action);
      setUnsavedModalVisible(true);
    });

    return unsubscribe;
  }, [form.isDirty, navigation]);

  const blurTextInputs = (): void => {
    titleInputRef.current?.blur();
    descriptionInputRef.current?.blur();
    Keyboard.dismiss();
  };

  const scrollToField = (field: EditableField): void => {
    const fieldOffsets: Record<EditableField, number> = {
      description: 340,
      title: 280,
    };

    window.setTimeout(() => {
      scrollViewRef.current?.scrollTo({
        animated: true,
        y: fieldOffsets[field],
      });
    }, 280);
  };

  const handleImagePick = async (
    field: 'mealImage' | 'restaurantLogo',
    source: 'documents' | 'gallery' = 'documents',
  ): Promise<void> => {
    blurTextInputs();

    const image =
      source === 'documents' ? await pickImage() : await pickImageFromLibrary();

    blurTextInputs();

    if (image?.uri) {
      form.updateField(field, image);
    }
  };

  const applyDescriptionFormat = (format: 'bold' | 'italic'): void => {
    const marker = format === 'bold' ? '**' : '*';
    const selectionStart = Math.min(
      descriptionSelection.start,
      descriptionSelection.end,
      descriptionDraft.length,
    );
    const selectionEnd = Math.min(
      Math.max(descriptionSelection.start, descriptionSelection.end),
      descriptionDraft.length,
    );
    const selectedText = descriptionDraft.slice(selectionStart, selectionEnd);
    const textToFormat = selectedText || 'texto';
    const nextDescription = [
      descriptionDraft.slice(0, selectionStart),
      marker,
      textToFormat,
      marker,
      descriptionDraft.slice(selectionEnd),
    ].join('');

    setDescriptionDraft(nextDescription);
    form.updateField('description', nextDescription);
    setDescriptionSelection({
      end: selectionStart + marker.length + textToFormat.length,
      start: selectionStart + marker.length,
    });
    setDescriptionInputKey((currentKey) => currentKey + 1);
  };

  const handleDelete = (): void => {
    if (!couponId) {
      return;
    }

    Alert.alert('Excluir cupom', 'Deseja excluir este card?', [
      { style: 'cancel', text: 'Cancelar' },
      {
        onPress: () => {
          allowExitRef.current = true;
          deleteCoupon(couponId);
          navigation.goBack();
        },
        style: 'destructive',
        text: 'Excluir',
      },
    ]);
  };

  const saveForm = (): boolean => {
    const result = form.validate();

    if (!result.ok) {
      return false;
    }

    if (couponId) {
      updateCoupon(couponId, result.data);
    } else {
      addCoupon(result.data);
    }

    return true;
  };

  const saveDraft = (): void => {
    if (couponId) {
      updateCoupon(couponId, form.values);
    } else {
      addCoupon(form.values);
    }
  };

  const leaveScreen = (): void => {
    allowExitRef.current = true;
    const action = pendingNavigationAction;

    setPendingNavigationAction(null);
    setUnsavedModalVisible(false);

    if (action) {
      navigation.dispatch(action);
      return;
    }

    navigation.goBack();
  };

  const handleSubmit = (): void => {
    if (!saveForm()) {
      return;
    }

    leaveScreen();
  };

  const handleSaveAndExit = (): void => {
    if (!saveForm()) {
      setUnsavedModalVisible(false);
      setMissingRequiredField(getMissingRequiredField(form.values));
      setInvalidDraftModalVisible(true);
      return;
    }

    leaveScreen();
  };

  const handleExitWithDraft = (): void => {
    saveDraft();
    setInvalidDraftModalVisible(false);
    leaveScreen();
  };

  const handleContinueEditing = (): void => {
    setMissingRequiredField(null);
    setPendingNavigationAction(null);
    setInvalidDraftModalVisible(false);
  };

  const handleDiscardAndExit = (): void => {
    leaveScreen();
  };

  const handleCancelExit = (): void => {
    setPendingNavigationAction(null);
    setUnsavedModalVisible(false);
  };

  if (couponId && !coupon) {
    return (
      <View style={styles.emptyState}>
        <Text style={styles.emptyTitle}>Cupom não encontrado.</Text>
        <Pressable onPress={() => navigation.goBack()} style={styles.secondaryButton}>
          <Text style={styles.secondaryButtonText}>Voltar</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? insets.top : 0}
      style={styles.screen}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={[
          styles.container,
          { paddingBottom: insets.bottom + spacing.xl + 260 },
        ]}
        keyboardDismissMode="interactive"
        keyboardShouldPersistTaps="handled"
        style={styles.scroll}
      >
      <Text style={styles.label}>Imagem do prato</Text>
      <Pressable
        accessibilityRole="button"
        onPress={() => handleImagePick('mealImage')}
        style={styles.imagePicker}
      >
        {form.values.mealImage ? (
          <Image source={form.values.mealImage} style={styles.mealPreview} />
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
            source={form.values.restaurantLogo}
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

      <Text style={styles.label}>Título *</Text>
      <TextInput
        ref={titleInputRef}
        autoCapitalize="words"
        onChangeText={(value) => form.updateField('title', value)}
        onFocus={() => scrollToField('title')}
        placeholder="Ex: Parma Pizza"
        placeholderTextColor={colors.textMuted}
        style={[styles.input, form.errors.title && styles.inputError]}
        value={form.values.title}
      />
      {form.errors.title ? (
        <Text style={styles.error}>{form.errors.title}</Text>
      ) : null}

      <Text style={styles.label}>Promoção</Text>
      <View style={styles.richTextEditor}>
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
          key={descriptionInputKey}
          ref={descriptionInputRef}
          autoCorrect={false}
          defaultValue={descriptionDraft}
          multiline
          onChangeText={(value) => {
            setDescriptionDraft(value);
            form.updateField('description', value);
          }}
          onFocus={() => scrollToField('description')}
          onSelectionChange={(event) =>
            setDescriptionSelection(event.nativeEvent.selection)
          }
          placeholder="Ex.: Na compra de **um rodízio** ganhe outro igual."
          placeholderTextColor={colors.textMuted}
          style={[styles.richTextInput, form.errors.description && styles.inputError]}
          textAlignVertical="top"
        />
      </View>
      {form.errors.description ? (
        <Text style={styles.error}>{form.errors.description}</Text>
      ) : null}

      <View style={styles.timeRow}>
        <View style={styles.timeField}>
          <Text style={styles.label}>Abertura *</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setTimePickerField('opening')}
            style={[styles.input, styles.timeSelect, form.errors.opening && styles.inputError]}
          >
            <Text style={styles.timeSelectText}>{form.values.opening}</Text>
          </Pressable>
          {form.errors.opening ? (
            <Text style={styles.error}>{form.errors.opening}</Text>
          ) : null}
        </View>

        <View style={styles.timeField}>
          <Text style={styles.label}>Fechamento *</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => setTimePickerField('close')}
            style={[styles.input, styles.timeSelect, form.errors.close && styles.inputError]}
          >
            <Text style={styles.timeSelectText}>{form.values.close}</Text>
          </Pressable>
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

        <Modal
          animationType="fade"
          onRequestClose={() => setTimePickerField(null)}
          transparent
          visible={timePickerField !== null}
        >
          <Pressable
            onPress={() => setTimePickerField(null)}
            style={styles.modalBackdrop}
          >
            <Pressable style={styles.timeModal} onPress={() => undefined}>
              <Text style={styles.timeModalTitle}>
                {timePickerField === 'opening'
                  ? 'Selecionar abertura'
                  : 'Selecionar fechamento'}
              </Text>
              <ScrollView style={styles.timeOptionsList}>
                {timeOptions.map((time) => (
                  <Pressable
                    key={time}
                    onPress={() => {
                      if (timePickerField) {
                        form.updateField(timePickerField, time);
                      }
                      setTimePickerField(null);
                    }}
                    style={styles.timeOption}
                  >
                    <Text style={styles.timeOptionText}>{time}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
        <Modal
          animationType="fade"
          onRequestClose={handleCancelExit}
          transparent
          visible={unsavedModalVisible}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.unsavedModal}>
              <Text style={styles.unsavedModalText}>
                Existem alterações não salvas. Deseja sair mesmo assim?
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleSaveAndExit}
                style={({ pressed }) => [
                  styles.unsavedButton,
                  styles.saveAndExitButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.unsavedButtonText}>Salvar e sair</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleDiscardAndExit}
                style={({ pressed }) => [
                  styles.unsavedButton,
                  styles.discardButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.unsavedButtonText}>Sair sem Salvar</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleCancelExit}
                style={({ pressed }) => [
                  styles.unsavedButton,
                  styles.cancelExitButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.unsavedButtonText}>Cancelar</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
        <Modal
          animationType="fade"
          onRequestClose={handleContinueEditing}
          transparent
          visible={invalidDraftModalVisible}
        >
          <View style={styles.modalBackdrop}>
            <View style={styles.unsavedModal}>
              <Text style={styles.unsavedModalText}>
                {`O campo '${missingRequiredField ?? 'obrigatório'}' é obrigatório. Por enquanto, ele não será exibido mas você pode continuar editando-o na tela 'Gerir'. Deseja mesmo sair?`}
              </Text>
              <Pressable
                accessibilityRole="button"
                onPress={handleExitWithDraft}
                style={({ pressed }) => [
                  styles.unsavedButton,
                  styles.discardButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.unsavedButtonText}>Sair assim mesmo</Text>
              </Pressable>
              <Pressable
                accessibilityRole="button"
                onPress={handleContinueEditing}
                style={({ pressed }) => [
                  styles.unsavedButton,
                  styles.cancelExitButton,
                  pressed && styles.buttonPressed,
                ]}
              >
                <Text style={styles.unsavedButtonText}>Continuar criando</Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </KeyboardAvoidingView>
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
  discardButton: {
    backgroundColor: '#E53935',
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
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.sm,
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
    fontSize: typography.caption,
    lineHeight: 16,
    paddingHorizontal: spacing.sm,
    textAlign: 'center',
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
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    flex: 1,
    justifyContent: 'center',
    padding: spacing.lg,
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
  screen: {
    backgroundColor: colors.background,
    flex: 1,
  },
  scroll: {
    backgroundColor: colors.background,
    flex: 1,
  },
  richTextEditor: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 10,
    borderWidth: 1,
    overflow: 'hidden',
  },
  richTextInput: {
    color: colors.text,
    fontFamily: typography.family.regular,
    fontSize: typography.body,
    minHeight: 156,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  timeField: {
    flex: 1,
  },
  timeModal: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    maxHeight: 360,
    overflow: 'hidden',
    width: '100%',
  },
  timeModalTitle: {
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.body,
    padding: spacing.md,
    textAlign: 'center',
  },
  timeOption: {
    alignItems: 'center',
    borderTopColor: colors.border,
    borderTopWidth: 1,
    height: 44,
    justifyContent: 'center',
  },
  timeOptionText: {
    color: colors.text,
    fontFamily: typography.family.semiBold,
    fontSize: typography.body,
  },
  timeOptionsList: {
    maxHeight: 300,
  },
  timeRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  timeSelect: {
    justifyContent: 'center',
  },
  timeSelectText: {
    color: colors.text,
    fontFamily: typography.family.regular,
    fontSize: typography.body,
  },
  cancelExitButton: {
    backgroundColor: colors.login,
  },
  saveAndExitButton: {
    backgroundColor: '#2fad2e',
  },
  unsavedButton: {
    alignItems: 'center',
    borderRadius: 14,
    height: 49,
    justifyContent: 'center',
    width: '100%',
  },
  unsavedButtonText: {
    color: colors.surface,
    fontFamily: typography.family.bold,
    fontSize: 16,
    lineHeight: 20,
  },
  unsavedModal: {
    backgroundColor: colors.surface,
    borderRadius: 14,
    gap: spacing.sm,
    padding: spacing.lg,
    width: '100%',
  },
  unsavedModalText: {
    color: colors.text,
    fontFamily: typography.family.bold,
    fontSize: typography.body,
    lineHeight: 22,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
});
