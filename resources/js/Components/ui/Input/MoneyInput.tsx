import { useState, useEffect, useRef, useCallback } from 'react';

interface MoneyInputProps {
  value: number;
  onChange: (value: number) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  allowNegative?: boolean;
}

const formatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

function centsToDisplay(cents: number, allowNegative: boolean): string {
  if (!allowNegative && cents < 0) {
    cents = 0;
  }
  const reais = cents / 100;
  if (allowNegative && reais < 0) {
    return '-' + formatter.format(Math.abs(reais));
  }
  return formatter.format(reais);
}

function parseReaisToCents(cleaned: string): number | null {
  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');

  let normalized: string;

  if (lastComma >= 0) {
    const fracDigits = cleaned.length - lastComma - 1;
    if (fracDigits >= 1) {
      const deciPart = cleaned.substring(lastComma + 1);
      let intPart = cleaned.substring(0, lastComma);
      intPart = intPart.replace(/\./g, '');
      normalized = intPart + '.' + deciPart;
    } else {
      normalized = cleaned.replace(/[.,]/g, '');
    }
  } else if (lastDot >= 0) {
    const fracDigits = cleaned.length - lastDot - 1;
    if (fracDigits >= 2 && fracDigits <= 3) {
      const deciPart = cleaned.substring(lastDot + 1);
      let intPart = cleaned.substring(0, lastDot);
      intPart = intPart.replace(/\./g, '');
      normalized = intPart + '.' + deciPart;
    } else {
      normalized = cleaned.replace(/[.,]/g, '');
    }
  } else {
    normalized = cleaned;
  }

  const parsedReais = parseFloat(normalized);
  if (isNaN(parsedReais) || !isFinite(parsedReais)) {
    return null;
  }
  return Math.round(parsedReais * 100);
}

function displayToCents(text: string, allowNegative: boolean): number {
  const isNegative = allowNegative && text.trim().startsWith('-');

  let cleaned = text.replace(/[R$\s]/g, '');

  if (isNegative) {
    cleaned = cleaned.replace('-', '');
  }

  const result = parseReaisToCents(cleaned);

  if (result === null) {
    console.warn('MoneyInput: unable to parse value', text);
    return 0;
  }

  if (!allowNegative && result < 0) {
    return 0;
  }

  return isNegative ? -result : result;
}

function pasteToCents(text: string, allowNegative: boolean): number {
  const isNegative = allowNegative && text.trim().startsWith('-');

  let cleaned = text.replace(/[R$\s]/g, '');

  if (isNegative) {
    cleaned = cleaned.replace('-', '');
  }

  const lastComma = cleaned.lastIndexOf(',');
  const lastDot = cleaned.lastIndexOf('.');
  const lastSep = Math.max(lastComma, lastDot);

  if (lastSep === -1) {
    const parsed = parseInt(cleaned, 10);
    if (isNaN(parsed) || !isFinite(parsed)) {
      console.warn('MoneyInput: unable to parse paste value', text);
      return 0;
    }
    if (!allowNegative && isNegative) {
      return 0;
    }
    return isNegative ? -parsed : parsed;
  }

  const result = parseReaisToCents(cleaned);

  if (result === null) {
    console.warn('MoneyInput: unable to parse paste value', text);
    return 0;
  }

  if (!allowNegative && result < 0) {
    return 0;
  }

  return isNegative ? -result : result;
}

export default function MoneyInput({
  value,
  onChange,
  label,
  error,
  disabled = false,
  required = false,
  allowNegative = false,
}: MoneyInputProps) {
  const [display, setDisplay] = useState(() =>
    centsToDisplay(value, allowNegative),
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const prevValueRef = useRef(value);

  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      if (document.activeElement !== inputRef.current) {
        setDisplay(centsToDisplay(value, allowNegative));
      }
    }
  }, [value, allowNegative]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      setDisplay(raw);
      const cents = displayToCents(raw, allowNegative);
      onChange(cents);
    },
    [onChange, allowNegative],
  );

  const handleBlur = useCallback(() => {
    const cents = displayToCents(display, allowNegative);
    setDisplay(centsToDisplay(cents, allowNegative));
    if (cents !== value) {
      onChange(cents);
    }
  }, [display, allowNegative, onChange, value]);

  const handlePaste = useCallback(
    (e: React.ClipboardEvent<HTMLInputElement>) => {
      e.preventDefault();
      const pasted = e.clipboardData.getData('text');
      const cents = pasteToCents(pasted, allowNegative);
      setDisplay(centsToDisplay(cents, allowNegative));
      onChange(cents);
    },
    [onChange, allowNegative],
  );

  const inputClasses = [
    'w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
    error ? 'border-danger-500' : '',
    disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        inputMode="decimal"
        value={display}
        onChange={handleChange}
        onBlur={handleBlur}
        onPaste={handlePaste}
        disabled={disabled}
        required={required}
        className={inputClasses}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
}
