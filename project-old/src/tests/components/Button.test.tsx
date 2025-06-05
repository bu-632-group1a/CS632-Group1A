import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '../../components/ui/Button';

describe('Button Component', () => {
  test('renders button with text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  test('applies variant styles correctly', () => {
    const { rerender } = render(<Button variant="primary">Primary</Button>);
    const primaryButton = screen.getByText('Primary');
    expect(primaryButton).toHaveClass('bg-primary-600');

    rerender(<Button variant="secondary">Secondary</Button>);
    const secondaryButton = screen.getByText('Secondary');
    expect(secondaryButton).toHaveClass('bg-secondary-600');
  });

  test('handles onClick events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  test('renders loading state correctly', () => {
    render(<Button isLoading>Loading</Button>);
    expect(screen.getByText('Loading')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('renders with icon', () => {
    render(
      <Button icon={<span data-testid="test-icon" />}>
        With Icon
      </Button>
    );
    
    expect(screen.getByText('With Icon')).toBeInTheDocument();
    expect(screen.getByTestId('test-icon')).toBeInTheDocument();
  });
});