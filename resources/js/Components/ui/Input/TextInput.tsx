import { forwardRef } from 'react';

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { label, error, className = '', disabled, ...props },
  ref,
) {
  const inputClasses = [
    'w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500',
    error ? 'border-danger-500' : '',
    disabled ? 'opacity-50 cursor-not-allowed bg-gray-100' : '',
    className,
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
        ref={ref}
        disabled={disabled}
        className={inputClasses}
        {...props}
      />
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
});
