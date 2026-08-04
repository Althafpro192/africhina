import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useToast } from './useToast.js';

/**
 * Lightweight form-validation composable.
 *
 * Rules are objects: { field, required, email, minLength, maxLength, match,
 *                       pattern, custom (fn returning true|errorMessage) }
 *
 * Usage:
 *   const { errors, summaryMessage, validate, validateField, clearErrors,
 *           focusFirstInvalid, submitGuard } = useFormValidation();
 *   if (!submitGuard(form, () => doSubmit())) return;
 *
 * The validator returns { valid: boolean, errors: Record<field,string> }.
 * `errors` is reactive; the consumer renders inline field errors and the
 * summary is surfaced as an inline `<BaseAlert type="error">` banner via the
 * `summaryMessage` ref OR a toast if mounted globally.
 *
 * i18n keys live under the `validation` namespace (see locales/*.json):
 *   validation.required, validation.email, validation.minLength,
 *   validation.maxLength, validation.passwordMismatch,
 *   validation.phoneInvalid, validation.numberInvalid, ...
 *
 * A component can also call `validateField(form, field, rules)` to do live
 * checks on blur without running the whole form at once.
 */
export function useFormValidation() {
    const { t } = useI18n();
    const { showToast } = useToast();

    const errors = reactive({});
    const summaryMessage = ref('');

    const getValue = (form, field) => {
        if (form == null) return '';
        if (Array.isArray(form)) return form;
        if (typeof form === 'object' && field.includes('.')) {
            return field
                .split('.')
                .reduce((acc, key) => (acc == null ? acc : acc[key]), form);
        }
        return form[field];
    };

    const setError = (field, message) => {
        if (message) {
            errors[field] = message;
        } else {
            delete errors[field];
        }
    };

    const clearErrors = () => {
        Object.keys(errors).forEach((k) => delete errors[k]);
        summaryMessage.value = '';
    };

    const checkRule = (rule, value, form) => {
        // Custom validator
        if (typeof rule.custom === 'function') {
            const result = rule.custom(value, form);
            if (result === true) return '';
            return typeof result === 'string' ? result : t('validation.invalid');
        }

        const isEmpty =
            value === undefined ||
            value === null ||
            value === '' ||
            (Array.isArray(value) && value.length === 0);

        // Required
        if (rule.required && isEmpty) {
            return rule.label
                ? t('validation.requiredLabel', { field: rule.label })
                : t('validation.required');
        }

        // Skip other rules if empty (unless explicitly required)
        if (isEmpty) return '';

        if (typeof value === 'string') {
            const trimmed = value.trim();
            if (rule.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
                return t('validation.email');
            }
            if (rule.minLength && trimmed.length < rule.minLength) {
                return t('validation.minLength', { min: rule.minLength });
            }
            if (rule.maxLength && trimmed.length > rule.maxLength) {
                return t('validation.maxLength', { max: rule.maxLength });
            }
            if (rule.pattern && !rule.pattern.test(trimmed)) {
                return t('validation.invalid');
            }
        }

        if (rule.numberInvalid && (Number.isNaN(Number(value)) || value === '')) {
            return t('validation.numberInvalid');
        }

        if (rule.phoneInvalid && typeof value === 'string') {
            // simple international E.164-ish sanity check
            const digits = value.replace(/\D/g, '');
            if (digits.length < 7 || digits.length > 15) {
                return t('validation.phoneInvalid');
            }
        }

        if (rule.match && form) {
            const compareValue = getValue(form, rule.match);
            if (value !== compareValue) {
                return t('validation.passwordMismatch');
            }
        }

        return '';
    };

    const validate = (form, rules) => {
        clearErrors();
        let firstInvalidField = null;
        const list = Array.isArray(rules) ? rules : [];
        for (const rule of list) {
            const value = getValue(form, rule.field);
            const message = checkRule(rule, value, form);
            if (message) {
                setError(rule.field, message);
                if (!firstInvalidField) firstInvalidField = rule.field;
            }
        }
        const valid = Object.keys(errors).length === 0;
        if (!valid) {
            summaryMessage.value =
                list.find((r) => r.label)?.labelCount > 1 || hasMultipleErrors(errors)
                    ? t('validation.fillAllFields')
                    : t('validation.requiredFieldsAbove');
        }
        return { valid, errors: { ...errors }, firstInvalidField };
    };

    const validateField = (form, field, rulesForField) => {
        const message = checkRule(rulesForField, getValue(form, field), form);
        setError(field, message);
        return !message;
    };

    const focusFirstInvalid = (rootEl) => {
        if (!rootEl) return;
        const firstErrorKey = Object.keys(errors)[0];
        if (!firstErrorKey) return;
        const target =
            rootEl.querySelector(`[data-field="${firstErrorKey}"]`) ||
            rootEl.querySelector(`[name="${firstErrorKey}"]`) ||
            rootEl.querySelector(`#${firstErrorKey}`);
        if (target && typeof target.focus === 'function') {
            target.focus({ preventScroll: false });
            target.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    };

    /**
     * Common submit handler wrapper.
     *   const onSubmit = () => submitGuard(form, rules, async () => { await api.call() });
     */
    const submitGuard = (form, rules, submitFn) => {
        const { valid } = validate(form, rules);
        if (!valid) {
            // Surface summary as a toast (instant feedback) — caller can also
            // render an inline `<BaseAlert>` by binding `summaryMessage`.
            showToast(t('validation.fillAllFields'), 'error');
            // Defer focus to next tick so DOM re-renders the inline errors first.
            setTimeout(() => focusFirstInvalid(document.activeElement?.closest('form')), 50);
            return false;
        }
        return Promise.resolve(submitFn()).catch((err) => {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                t('common.unknownError', 'Something went wrong');
            summaryMessage.value = message;
            showToast(message, 'error');
            throw err;
        });
    };

    return {
        errors,
        summaryMessage,
        validate,
        validateField,
        clearErrors,
        focusFirstInvalid,
        submitGuard
    };
}

function hasMultipleErrors(errs) {
    return Object.keys(errs).length > 1;
}
