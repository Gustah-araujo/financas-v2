import { useEffect, useRef } from 'react';
import TomSelect from 'tom-select';

interface SelectProps {
  options?: { value: string | number; label: string }[];
  value?: string | number | string[];
  onChange?: (value: string | string[]) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  multiple?: boolean;
  load?: (
    query: string,
    callback: (options: { value: string | number; label: string }[]) => void,
  ) => void;
  create?: boolean;
}

export default function Select({
  options,
  value,
  onChange,
  placeholder,
  label,
  error,
  disabled = false,
  required = false,
  multiple = false,
  load,
  create = false,
}: SelectProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const selectRef = useRef<HTMLSelectElement | HTMLInputElement>(null);
  const instanceRef = useRef<TomSelect | null>(null);
  const onChangeRef = useRef(onChange);

  onChangeRef.current = onChange;

  useEffect(() => {
    const el = selectRef.current;
    if (!el) return;

    const mappedOptions = options?.map((opt) => ({
      value: String(opt.value),
      text: opt.label,
    }));

    const instance = new TomSelect(el, {
      options: mappedOptions || [],
      items: value !== undefined ? (Array.isArray(value) ? value.map(String) : [String(value)]) : undefined,
      placeholder: placeholder || undefined,
      maxItems: multiple ? null : 1,
      create: create,
      load: load
        ? (query: string, callback: (opts: { value: string | number; text: string }[]) => void) => {
            load(query, (result) => {
              callback(result.map((o) => ({ value: String(o.value), text: o.label })));
            });
          }
        : undefined,
      onChange: (val: string | string[]) => {
        if (multiple) {
          onChangeRef.current?.(Array.isArray(val) ? val : [val]);
        } else {
          onChangeRef.current?.(Array.isArray(val) ? val[0] ?? '' : val);
        }
      },
    });

    instanceRef.current = instance;

    return () => {
      instance.destroy();
      instanceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance || value === undefined) return;

    instance.setValue(
      Array.isArray(value) ? value.map(String) : [String(value)],
      true,
    );
  }, [value]);

  useEffect(() => {
    const instance = instanceRef.current;
    if (!instance) return;
    if (disabled) {
      instance.disable();
    } else {
      instance.enable();
    }
  }, [disabled]);

  const wrapperClasses = [
    'ts-wrapper-custom',
    error ? 'border-danger-500 rounded-md' : '',
  ]
    .filter(Boolean)
    .join(' ');

  const Tag = multiple ? 'select' : 'input';

  return (
    <div>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {label}
        </label>
      )}
      <div ref={containerRef} className={wrapperClasses}>
        <Tag
          ref={selectRef as React.Ref<HTMLSelectElement & HTMLInputElement>}
          multiple={multiple}
          required={required}
        />
      </div>
      {error && (
        <p className="mt-1 text-sm text-danger-600">{error}</p>
      )}
    </div>
  );
}
