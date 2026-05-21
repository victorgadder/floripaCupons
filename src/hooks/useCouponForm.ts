import { useMemo, useState } from 'react';
import { ZodError } from 'zod';

import type { CouponFormInput } from '../types/coupon';
import { couponFormSchema } from '../utils/couponValidation';

type CouponFormErrors = Partial<Record<keyof CouponFormInput, string>>;

type CouponFormValidationResult =
  | {
      data: CouponFormInput;
      ok: true;
    }
  | {
      ok: false;
    };

type UseCouponFormResult = {
  errors: CouponFormErrors;
  isDirty: boolean;
  updateField: <Field extends keyof CouponFormInput>(
    field: Field,
    value: CouponFormInput[Field],
  ) => void;
  validate: () => CouponFormValidationResult;
  values: CouponFormInput;
};

const isCouponFormField = (field: PropertyKey): field is keyof CouponFormInput =>
  [
    'bonus',
    'close',
    'description',
    'mealImage',
    'opening',
    'restaurantLogo',
    'title',
  ].includes(String(field));

export const useCouponForm = (
  initialValues: CouponFormInput,
): UseCouponFormResult => {
  const [values, setValues] = useState<CouponFormInput>(initialValues);
  const [errors, setErrors] = useState<CouponFormErrors>({});

  const isDirty = useMemo(
    () => JSON.stringify(values) !== JSON.stringify(initialValues),
    [initialValues, values],
  );

  const updateField = <Field extends keyof CouponFormInput>(
    field: Field,
    value: CouponFormInput[Field],
  ): void => {
    setErrors((currentErrors) => ({
      ...currentErrors,
      [field]: undefined,
    }));
    setValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }));
  };

  const validate = (): CouponFormValidationResult => {
    try {
      setErrors({});
      return {
        data: couponFormSchema.parse(values),
        ok: true,
      };
    } catch (error) {
      if (error instanceof ZodError) {
        const nextErrors: CouponFormErrors = {};

        error.issues.forEach((issue) => {
          const field = issue.path[0];

          if (field && isCouponFormField(field) && !nextErrors[field]) {
            nextErrors[field] = issue.message;
          }
        });

        setErrors(nextErrors);
      }

      return {
        ok: false,
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
