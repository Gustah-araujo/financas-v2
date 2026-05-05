import { useEffect, useId, useRef } from 'react';

interface CheckboxProps {
  label?: string;
  checked?: boolean;
  indeterminate?: boolean;
  disabled?: boolean;
  onChange?: (checked: boolean) => void;
}

export default function Checkbox({
  label,
  checked,
  indeterminate = false,
  disabled = false,
  onChange,
}: CheckboxProps) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.indeterminate = indeterminate;
    }
  }, [indeterminate]);

  const inputClasses = [
    'rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const labelClasses = [
    'ml-2 text-sm text-gray-700',
    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="inline-flex items-center">
      <input
        ref={ref}
        id={id}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
        className={inputClasses}
      />
      {label && (
        <label htmlFor={id} className={labelClasses}>
          {label}
        </label>
      )}
    </div>
  );
}
