import { useId } from 'react';

interface DateInputProps {
  value: string;
  onChange: (value: string) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  min?: string;
  max?: string;
}

export default function DateInput({
  value,
  onChange,
  label,
  error,
  disabled,
  required,
  min,
  max,
}: DateInputProps) {
  const id = useId();

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
        <label htmlFor={id} className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <input
        id={id}
        type="date"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        min={min}
        max={max}
        className={inputClasses}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
}
