import { useMemo, useState } from 'react';
import { ZodError } from 'zod';

import { couponFormSchema } from '../utils/couponValidation';

type CouponFormValues = {
  title: string;
  description: string;
};

export const useCouponForm = (initialValues: CouponFormValues) => {
  const [values, setValues] = useState<CouponFormValues>(initialValues);
  const [titleError, setTitleError] = useState<string | null>(null);

  const isDirty = useMemo(
    () =>
      values.title !== initialValues.title ||
      values.description !== initialValues.description,
    [
      initialValues.description,
      initialValues.title,
      values.description,
      values.title,
    ],
  );

  const updateField = (field: keyof CouponFormValues, value: string) => {
    setTitleError(null);
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const validate = () => {
    try {
      return {
        ok: true as const,
        data: couponFormSchema.parse(values),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        setTitleError(error.issues[0]?.message ?? 'Revise os dados do cupom.');
      }

      return {
        ok: false as const,
      };
    }
  };

  return {
    isDirty,
    titleError,
    updateField,
    validate,
    values,
  };
};
