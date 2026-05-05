import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect } from 'vitest';
import TextInput from '@/Components/ui/Input/TextInput';

describe('TextInput', () => {
  it('renders with label', () => {
    render(<TextInput label="Name" />);
    expect(screen.getByText('Name')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(<TextInput label="Name" error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('applies error border class when error is set', () => {
    render(<TextInput label="Name" error="Required field" />);
    const input = screen.getByRole('textbox');
    expect(input.className).toContain('border-danger-500');
  });

  it('accepts ref via forwardRef', () => {
    let inputElement: HTMLInputElement | null = null;
    render(<TextInput ref={(el) => { inputElement = el; }} label="Name" />);
    expect(inputElement).toBeInstanceOf(HTMLInputElement);
  });

  it('handles onChange', async () => {
    let value = '';
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      value = e.target.value;
    };
    const user = userEvent.setup();
    render(<TextInput label="Name" onChange={handleChange} />);
    const input = screen.getByRole('textbox');
    await user.type(input, 'Hello');
    expect(value).toBe('Hello');
  });

  it('applies disabled styles when disabled', () => {
    render(<TextInput label="Name" disabled />);
    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input.className).toContain('opacity-50');
    expect(input.className).toContain('cursor-not-allowed');
  });

  it('does not render label when not provided', () => {
    const { container } = render(<TextInput />);
    const labels = container.querySelectorAll('label');
    expect(labels.length).toBe(0);
  });

  it('does not render error message when error is not provided', () => {
    const { container } = render(<TextInput label="Name" />);
    const paragraphs = container.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });
});
