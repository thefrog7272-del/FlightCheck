import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Toast } from '../Toast';

describe('Toast', () => {
  it('renders message', () => {
    render(<Toast message="Hello" onDismiss={() => {}} />);
    expect(screen.getByText('Hello')).toBeTruthy();
  });

  it('renders action button when provided', () => {
    const onClick = vi.fn();
    render(<Toast message="Test" action={{ label: 'Undo', onClick }} onDismiss={() => {}} />);
    expect(screen.getByText('Undo')).toBeTruthy();
  });

  it('calls onDismiss when close button clicked', () => {
    const onDismiss = vi.fn();
    render(<Toast message="Test" onDismiss={onDismiss} />);
    const buttons = screen.getAllByRole('button');
    fireEvent.click(buttons[0]); // close button
    expect(onDismiss).toHaveBeenCalled();
  });

  it('calls action onClick and dismisses', () => {
    const onClick = vi.fn();
    const onDismiss = vi.fn();
    render(<Toast message="Test" action={{ label: 'Undo', onClick }} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByText('Undo'));
    expect(onClick).toHaveBeenCalled();
    expect(onDismiss).toHaveBeenCalled();
  });
});
