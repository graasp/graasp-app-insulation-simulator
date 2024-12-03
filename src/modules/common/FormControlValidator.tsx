import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';

import {
  FormControl,
  FormHelperText,
  InputAdornment,
  InputLabel,
  OutlinedInput,
} from '@mui/material';

const FORM_ERROR_KEYS = {
  Required: 'Required',
  InvalidNumber: 'InvalidNumber',
  Min: 'Min',
  Max: 'Max',
} as const;

type FormErrorKeys = keyof typeof FORM_ERROR_KEYS;

export type ValidationRule = {
  test: (value: string) => boolean;
  message: string;
};

type ValidationRulesProps = {
  required?: boolean;
  isNumber?: boolean;
  min?: number;
  max?: number;
  customRules?: ValidationRule[];
};

type FormControlValidatorProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  validationRules?: ValidationRulesProps;
  inputType?: 'number' | 'text';
  unit?: React.ReactNode;
};

const ValidationRulesFactory = (
  validationRules?: ValidationRulesProps,
): ValidationRule[] => {
  if (!validationRules) {
    return [];
  }

  const { required, isNumber, min, max, customRules } = validationRules;
  const rules: ValidationRule[] = [];

  if (required) {
    rules.push({
      test: (v: string) => Boolean(v),
      message: FORM_ERROR_KEYS.Required,
    });
  }

  if (min !== undefined || max !== undefined || isNumber) {
    rules.push({
      test: (v: string) => !Number.isNaN(Number.parseFloat(v)),
      message: FORM_ERROR_KEYS.InvalidNumber,
    });
  }

  if (min !== undefined) {
    rules.push({
      test: (v: string) => Number.parseFloat(v) >= min,
      message: FORM_ERROR_KEYS.Min,
    });
  }

  if (max !== undefined) {
    rules.push({
      test: (v: string) => Number.parseFloat(v) <= max,
      message: FORM_ERROR_KEYS.Max,
    });
  }

  if (customRules) {
    rules.push(...customRules);
  }

  return rules;
};

export const FormControlValidator = ({
  label,
  value,
  onChange,
  validationRules,
  inputType,
  unit,
}: FormControlValidatorProps): JSX.Element => {
  const { t } = useTranslation('ERROR_BOUNDARY', {
    keyPrefix: 'INPUT_VALIDATOR',
  });
  const [controlledValue, setControlledValue] = useState<string>(String(value));
  const [error, setError] = useState<string | undefined>();
  const rules = useMemo(
    () => ValidationRulesFactory(validationRules),
    [validationRules],
  );

  const handleValueChange = (newValue: string): void => {
    setControlledValue(newValue);

    const { message } = rules.find((rule) => !rule.test(newValue)) ?? {};

    setError(message);

    if (!message) {
      onChange(newValue);
    }
  };

  return (
    <FormControl fullWidth error={Boolean(error)}>
      <InputLabel htmlFor={label.toLowerCase().replace(/ /g, '-')}>
        {label}
      </InputLabel>
      <OutlinedInput
        id={label.toLowerCase().replace(/ /g, '-')}
        label={label}
        value={controlledValue}
        onChange={(e) => handleValueChange(e.target.value)}
        type={inputType ?? (validationRules?.isNumber ? 'number' : undefined)}
        endAdornment={
          unit ? (
            <InputAdornment position="end">{unit}</InputAdornment>
          ) : undefined
        }
      />
      {error && (
        <FormHelperText
          data-testid={`error-${label.toLowerCase()}-${error.toLowerCase()}`}
          error
        >
          {t(error as FormErrorKeys, {
            min: validationRules?.min,
            max: validationRules?.max,
          })}
        </FormHelperText>
      )}
    </FormControl>
  );
};
