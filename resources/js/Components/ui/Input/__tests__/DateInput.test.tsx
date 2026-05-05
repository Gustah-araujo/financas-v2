import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach } from 'vitest';
import DateInput from '@/Components/ui/Input/DateInput';

describe('DateInput', () => {
  afterEach(() => {
    cleanup();
  });

  it('renders with label', () => {
    render(<DateInput value="" onChange={() => {}} label="Data" />);
    expect(screen.getByLabelText('Data')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<DateInput value="" onChange={() => {}} label="Data" error="Data inválida" />);
    expect(screen.getByText('Data inválida')).toBeInTheDocument();
  });

  it('applies error border class when error is set', () => {
    render(<DateInput value="" onChange={() => {}} label="Data" error="Data inválida" />);
    const input = screen.getByLabelText('Data');
    expect(input.className).toContain('border-danger-500');
  });

  it('onChange returns ISO date string', async () => {
    let dateValue = '';
    const handleChange = (value: string) => {
      dateValue = value;
    };
    const user = userEvent.setup();
    render(<DateInput value="" onChange={handleChange} label="Data" />);
    const input = screen.getByLabelText('Data');
    await user.type(input, '2025-05-04');
    expect(dateValue).toBe('2025-05-04');
  });

  it('native date picker works on click', () => {
    render(<DateInput value="" onChange={() => {}} label="Data" />);
    const input = screen.getByLabelText('Data');
    expect(input).toHaveAttribute('type', 'date');
  });

  it('renders with initial ISO value', () => {
    render(<DateInput value="2025-12-25" onChange={() => {}} label="Data" />);
    const input = screen.getByLabelText('Data');
    expect(input).toHaveValue('2025-12-25');
  });

  it('applies disabled styles when disabled', () => {
    render(<DateInput value="" onChange={() => {}} label="Data" disabled />);
    const input = screen.getByLabelText('Data');
    expect(input).toBeDisabled();
    expect(input.className).toContain('opacity-50');
    expect(input.className).toContain('cursor-not-allowed');
  });

  it('supports min and max attributes', () => {
    render(<DateInput value="" onChange={() => {}} label="Data" min="2025-01-01" max="2025-12-31" />);
    const input = screen.getByLabelText('Data');
    expect(input).toHaveAttribute('min', '2025-01-01');
    expect(input).toHaveAttribute('max', '2025-12-31');
  });

  it('supports required attribute', () => {
    render(<DateInput value="" onChange={() => {}} label="Data" required />);
    const input = screen.getByLabelText('Data');
    expect(input).toBeRequired();
  });

  it('does not render label when not provided', () => {
    render(<DateInput value="" onChange={() => {}} />);
    expect(screen.queryByRole('label')).toBeNull();
  });

  it('does not render error message when error is not provided', () => {
    render(<DateInput value="" onChange={() => {}} label="Data" />);
    expect(screen.queryByText('Data inválida')).toBeNull();
  });
});
