import type { RadioOption } from '@/types/ui';
import { useId } from 'react';

interface RadioGroupProps {
  options: RadioOption[];
  value?: string | number;
  onChange?: (value: string | number) => void;
  label?: string;
  error?: string;
  disabled?: boolean;
}

export default function RadioGroup({
  options,
  value,
  onChange,
  label,
  error,
  disabled = false,
}: RadioGroupProps) {
  const groupId = useId();

  return (
    <fieldset disabled={disabled}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <div className="space-y-2">
        {options.map((option, index) => {
          const optionId = `${groupId}-${index}`;
          const isChecked = value !== undefined && value === option.value;

          return (
            <div key={optionId}>
              <div className="flex items-center gap-2">
                <input
                  id={optionId}
                  type="radio"
                  name={groupId}
                  value={option.value}
                  checked={isChecked}
                  disabled={disabled}
                  onChange={() => onChange?.(option.value)}
                  className={[
                    'border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500',
                    disabled ? 'opacity-50 cursor-not-allowed' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                />
                <div>
                  <label
                    htmlFor={optionId}
                    className={[
                      'text-sm text-gray-700',
                      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                    ]
                      .filter(Boolean)
                      .join(' ')}
                  >
                    {option.label}
                  </label>
                  {option.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{option.description}</p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      {error && <p className="mt-1 text-sm text-danger-600">{error}</p>}
    </fieldset>
  );
}
