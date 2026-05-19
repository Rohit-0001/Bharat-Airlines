import { AbstractControl, ValidationErrors } from '@angular/forms';

export const STRONG_PASSWORD_PATTERN =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

export const INDIAN_MOBILE_PATTERN = /^[6-9]\d{9}$/;

export interface PasswordRule {
  id: string;
  message: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: PasswordRule[] = [
  { id: 'length', message: 'At least 8 characters', test: (v) => v.length >= 8 },
  { id: 'upper', message: 'At least one uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { id: 'lower', message: 'At least one lowercase letter', test: (v) => /[a-z]/.test(v) },
  { id: 'number', message: 'At least one number', test: (v) => /\d/.test(v) },
  {
    id: 'special',
    message: 'At least one special character (@, $, !, %, *, ?, &)',
    test: (v) => /[@$!%*?&]/.test(v)
  }
];

export function isPasswordValid(password: string): boolean {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}

/** Live password hints — only unmet rules, or "required" when empty. */
export function getActivePasswordMessages(
  password: string | null | undefined,
  showFeedback: boolean
): string[] {
  if (!showFeedback) {
    return [];
  }
  const value = password ?? '';
  if (!value) {
    return ['Password is required'];
  }
  return PASSWORD_RULES.filter((rule) => !rule.test(value)).map((rule) => rule.message);
}

export function strongPasswordValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (!value) {
    return null;
  }
  return isPasswordValid(value) ? null : { strongPassword: true };
}

export function indianMobileValidator(control: AbstractControl): ValidationErrors | null {
  const value = control.value;
  if (value === '' || value === null || value === undefined) {
    return null;
  }
  return INDIAN_MOBILE_PATTERN.test(String(value)) ? null : { invalidPhone: true };
}

export function differentCitiesValidator(control: AbstractControl): ValidationErrors | null {
  const source = (control.get('source')?.value || '').trim().toLowerCase();
  const destination = (control.get('destination')?.value || '').trim().toLowerCase();
  if (source && destination && source === destination) {
    return { sameCity: true };
  }
  return null;
}

export function availableSeatsValidator(control: AbstractControl): ValidationErrors | null {
  const total = Number(control.get('totalSeats')?.value);
  const available = Number(control.get('available_seats')?.value);
  if (total > 0 && !isNaN(available) && available > total) {
    return { exceedsTotal: true };
  }
  return null;
}
