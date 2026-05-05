import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import MoneyInput from '@/Components/ui/Input/MoneyInput';

describe('MoneyInput', () => {
  it('renders with label', () => {
    render(<MoneyInput value={0} onChange={() => {}} label="Valor" />);
    expect(screen.getByText('Valor')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <MoneyInput value={0} onChange={() => {}} error="Valor obrigatório" />,
    );
    expect(screen.getByText('Valor obrigatório')).toBeInTheDocument();
  });

  it('applies error border class when error is set', () => {
    render(
      <MoneyInput value={0} onChange={() => {}} error="Valor obrigatório" />,
    );
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-danger-500');
  });

  it('applies disabled styles when disabled', () => {
    render(<MoneyInput value={0} onChange={() => {}} disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input.className).toContain('opacity-50');
    expect(input.className).toContain('cursor-not-allowed');
  });

  it('displays formatted BRL value on initial render', () => {
    render(<MoneyInput value={15000} onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toContain('150,00');
  });

  it('displays R$ 0,00 for zero value', () => {
    render(<MoneyInput value={0} onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toMatch(/R\$\s*0,00/);
  });

  it('displays formatted BRL with thousands separator', () => {
    render(<MoneyInput value={125000} onChange={() => {}} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toContain('1.250,00');
  });

  it('converts user typing to cents for onChange', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MoneyInput value={0} onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.clear(input);
    await user.type(input, '150,00');

    const calls = onChange.mock.calls;
    const lastCall = calls[calls.length - 1]?.[0];
    expect(lastCall).toBe(15000);
  });

  it('reformats display on blur', async () => {
    const onChange = vi.fn();
    render(<MoneyInput value={0} onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '1500' } });
    fireEvent.blur(input);

    expect(input.value).toContain('1.500,00');
  });

  it('handles paste of formatted BRL text', async () => {
    const onChange = vi.fn();
    render(<MoneyInput value={0} onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    fireEvent.paste(input, {
      clipboardData: {
        getData: () => 'R$ 1.500,00',
      },
    });

    expect(input.value).toContain('1.500,00');
    expect(onChange).toHaveBeenCalledWith(150000);
  });

  it('handles paste of plain number string', async () => {
    const onChange = vi.fn();
    render(<MoneyInput value={0} onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    fireEvent.paste(input, {
      clipboardData: {
        getData: () => '1500.00',
      },
    });

    expect(onChange).toHaveBeenCalledWith(150000);
  });

  it('handles paste of cents-only integer string', async () => {
    const onChange = vi.fn();
    render(<MoneyInput value={0} onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    fireEvent.paste(input, {
      clipboardData: {
        getData: () => '150000',
      },
    });

    expect(onChange).toHaveBeenCalledWith(150000);
  });

  it('shows negative value when allowNegative is true', () => {
    render(
      <MoneyInput value={-5000} onChange={() => {}} allowNegative />,
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toMatch(/-R\$\s*50,00/);
  });

  it('clamps negative values to zero when allowNegative is false', () => {
    render(
      <MoneyInput value={-5000} onChange={() => {}} />,
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).not.toContain('-');
    expect(input.value).toContain('0,00');
  });

  it('updates display when external value changes', () => {
    const { rerender } = render(
      <MoneyInput value={0} onChange={() => {}} />,
    );
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toContain('0,00');

    rerender(<MoneyInput value={50000} onChange={() => {}} />);
    expect(input.value).toContain('500,00');
  });

  it('does not render label when not provided', () => {
    render(<MoneyInput value={0} onChange={() => {}} />);
    const labels = document.querySelectorAll('label');
    expect(labels.length).toBe(0);
  });

  it('does not render error message when error is not provided', () => {
    render(<MoneyInput value={0} onChange={() => {}} />);
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });

  it('handles typing negative value with allowNegative', async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<MoneyInput value={0} onChange={onChange} allowNegative />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    await user.clear(input);
    await user.type(input, '-50,00');

    const calls = onChange.mock.calls;
    const lastCall = calls[calls.length - 1]?.[0];
    expect(lastCall).toBe(-5000);
  });

  it('parses decimal cents correctly', () => {
    const onChange = vi.fn();
    render(<MoneyInput value={0} onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '12,34' } });
    expect(onChange).toHaveBeenCalledWith(1234);
  });

  it('rounds fractional cents on parse', () => {
    const onChange = vi.fn();
    render(<MoneyInput value={0} onChange={onChange} />);
    const input = screen.getByRole('textbox') as HTMLInputElement;

    fireEvent.change(input, { target: { value: '1,999' } });
    expect(onChange).toHaveBeenCalledWith(200);
  });
});
