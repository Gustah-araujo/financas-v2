import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import Select from '@/Components/ui/Input/Select';

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getTomSelectInstance(): any {
  const input = document.querySelector('.tomselected') as any;
  return input?.tomselect ?? null;
}

describe('Select', () => {
  const defaultOptions = [
    { value: '1', label: 'Option 1' },
    { value: '2', label: 'Option 2' },
    { value: '3', label: 'Option 3' },
  ];

  it('renders with label', () => {
    render(<Select label="Choose" options={defaultOptions} />);
    expect(screen.getByText('Choose')).toBeInTheDocument();
  });

  it('shows error message', () => {
    render(
      <Select label="Choose" error="Required field" options={defaultOptions} />,
    );
    expect(screen.getByText('Required field')).toBeInTheDocument();
  });

  it('renders and opens dropdown with options', async () => {
    render(<Select options={defaultOptions} placeholder="Pick one" />);
    await sleep(50);

    const ts = getTomSelectInstance();
    expect(ts).toBeTruthy();

    ts.open();
    await sleep(50);

    await waitFor(() => {
      const options = document.querySelectorAll('.ts-dropdown .option');
      expect(options.length).toBe(3);
    });
  });

  it('selects an option and calls onChange', async () => {
    const handleChange = vi.fn();
    render(
      <Select options={defaultOptions} onChange={handleChange} />,
    );
    await sleep(50);

    const ts = getTomSelectInstance();
    ts.addItem('2');
    await sleep(50);

    expect(handleChange).toHaveBeenCalled();
  });

  it('displays placeholder in the control input', async () => {
    render(<Select options={defaultOptions} placeholder="Select something" />);
    await sleep(50);

    const controlInput = document.querySelector('.ts-control input') as HTMLInputElement;
    expect(controlInput).toBeTruthy();
    expect(controlInput?.placeholder).toBe('Select something');
  });

  it('applies disabled state', async () => {
    const { rerender } = render(
      <Select options={defaultOptions} disabled={true} />,
    );
    await sleep(50);

    const wrapper = document.querySelector('.ts-wrapper');
    expect(wrapper?.classList.contains('disabled')).toBe(true);

    rerender(<Select options={defaultOptions} disabled={false} />);
    await sleep(50);

    expect(wrapper?.classList.contains('disabled')).toBe(false);
  });

  it('does not render label when not provided', () => {
    render(<Select options={defaultOptions} />);
    const labels = document.querySelectorAll('label');
    expect(labels.length).toBe(0);
  });

  it('does not render error when not provided', () => {
    render(<Select options={defaultOptions} />);
    const paragraphs = document.querySelectorAll('p');
    expect(paragraphs.length).toBe(0);
  });

  it('renders with external value set', async () => {
    render(<Select options={defaultOptions} value="2" />);
    await sleep(50);

    const ts = getTomSelectInstance();
    expect(ts.getValue()).toBe('2');
  });

  it('supports multiple select mode', async () => {
    render(<Select options={defaultOptions} multiple={true} />);
    await sleep(50);

    const wrapper = document.querySelector('.ts-wrapper');
    expect(wrapper?.classList.contains('multi')).toBe(true);
  });
});
