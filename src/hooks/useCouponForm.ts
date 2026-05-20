import { useMemo, useState } from 'react';
import { ZodError } from 'zod';

import type { CouponFormInput } from '../types/coupon';
import { couponFormSchema } from '../utils/couponValidation';

type CouponFormErrors = Partial<Record<keyof CouponFormInput, string>>;

export const useCouponForm = (initialValues: CouponFormInput) => {
  const [values, setValues] = useState<CouponFormInput>(initialValues);
  const [errors, setErrors] = useState<CouponFormErrors>({});

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [initialValues, values],
  );

  const updateField = <Field extends keyof CouponFormInput>(
    field: Field,
    value: CouponFormInput[Field],
  ) => {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const validate = () => {
    try {
      setErrors({});
      return {
        ok: true as const,
        data: couponFormSchema.parse(values),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const nextErrors: CouponFormErrors = {};

        error.issues.forEach((issue) => {
          const field = issue.path[0] as keyof CouponFormInput | undefined;

          if (field && !nextErrors[field]) {
            nextErrors[field] = issue.message;
          }
        });

        setErrors(nextErrors);
      }

      return {
        ok: false as const,
      };
    }
  };

  return {
    errors,
    isDirty,
    updateField,
    validate,
    values,
  };
};
