import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, afterEach } from 'vitest';
import Checkbox from '@/Components/ui/Input/Checkbox';
import RadioGroup from '@/Components/ui/Input/RadioGroup';

describe('Checkbox', () => {
  afterEach(cleanup);

  it('renders with label inline', () => {
    render(<Checkbox label="Accept terms" />);
    expect(screen.getByText('Accept terms')).toBeInTheDocument();
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
  });

  it('renders without label', () => {
    render(<Checkbox />);
    expect(screen.getByRole('checkbox')).toBeInTheDocument();
    expect(document.querySelector('label')).toBeNull();
  });

  it('sets indeterminate via ref', () => {
    const { container } = render(<Checkbox label="Select all" indeterminate />);
    const input = container.querySelector('input[type="checkbox"]') as HTMLInputElement;
    expect(input.indeterminate).toBe(true);
  });

  it('toggles on label click', async () => {
    let toggled = false;
    const handleChange = (checked: boolean) => {
      toggled = checked;
    };
    const user = userEvent.setup();
    render(<Checkbox label="Toggle me" onChange={handleChange} />);
    const label = screen.getByText('Toggle me');
    await user.click(label);
    expect(toggled).toBe(true);
  });

  it('fires onChange when clicking checkbox', async () => {
    let result = false;
    const handleChange = (checked: boolean) => {
      result = checked;
    };
    const user = userEvent.setup();
    render(<Checkbox label="Click" onChange={handleChange} />);
    await user.click(screen.getByRole('checkbox'));
    expect(result).toBe(true);
  });

  it('applies disabled styles', () => {
    render(<Checkbox label="Disabled" disabled />);
    const checkbox = screen.getByRole('checkbox');
    expect(checkbox).toBeDisabled();
    expect(checkbox.className).toContain('opacity-50');
    expect(checkbox.className).toContain('cursor-not-allowed');
  });

  it('does not fire onChange when disabled', async () => {
    let fired = false;
    const user = userEvent.setup();
    render(<Checkbox label="Disabled" disabled onChange={() => { fired = true; }} />);
    await user.click(screen.getByRole('checkbox'));
    expect(fired).toBe(false);
  });
});

describe('RadioGroup', () => {
  afterEach(cleanup);

  const options = [
    { value: 'option1', label: 'Option 1', description: 'First option' },
    { value: 'option2', label: 'Option 2', description: 'Second option' },
    { value: 'option3', label: 'Option 3' },
  ];

  it('renders all options', () => {
    render(<RadioGroup options={options} />);
    expect(screen.getByText('Option 1')).toBeInTheDocument();
    expect(screen.getByText('Option 2')).toBeInTheDocument();
    expect(screen.getByText('Option 3')).toBeInTheDocument();
  });

  it('renders group label', () => {
    render(<RadioGroup options={options} label="Choose one" />);
    expect(screen.getByText('Choose one')).toBeInTheDocument();
  });

  it('shows description when provided', () => {
    render(<RadioGroup options={options} />);
    expect(screen.getByText('First option')).toBeInTheDocument();
    expect(screen.getByText('Second option')).toBeInTheDocument();
  });

  it('selects the provided value', () => {
    render(<RadioGroup options={options} value="option2" />);
    const radio = screen.getByLabelText('Option 2') as HTMLInputElement;
    expect(radio.checked).toBe(true);
  });

  it('fires onChange with selected value', async () => {
    let selected = '';
    const handleChange = (value: string | number) => {
      selected = value as string;
    };
    const user = userEvent.setup();
    render(<RadioGroup options={options} onChange={handleChange} />);
    await user.click(screen.getByLabelText('Option 1'));
    expect(selected).toBe('option1');
  });

  it('shows error message', () => {
    render(<RadioGroup options={options} error="Required field" />);
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('disables all options when disabled', () => {
    render(<RadioGroup options={options} disabled />);
    const radios = screen.getAllByRole('radio');
    radios.forEach((r) => expect(r).toBeDisabled());
  });

  it('does not show error when not provided', () => {
    render(<RadioGroup options={options} />);
    expect(screen.queryByText('Required field')).toBeNull();
  });
});
