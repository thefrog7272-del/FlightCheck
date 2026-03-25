import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Home } from './Home';
import { MemoryRouter } from 'react-router-dom';
import '@testing-library/jest-dom';

describe('Home Page', () => {
  const renderHome = () => {
    render(
      <MemoryRouter>
        <Home />
      </MemoryRouter>
    );
  };

  it('renders the fleet title', () => {
    renderHome();
    expect(screen.getByText(/Select a Plane/i)).toBeInTheDocument();
  });

  it('filters planes by manufacturer', () => {
    renderHome();
    const searchInput = screen.getByPlaceholderText(/Search by model or manufacturer/i);
    
    // Initial state: Cessna 172 should be visible
    expect(screen.getByText(/Cessna 172 Skyhawk/i)).toBeInTheDocument();
    
    // Search for Boeing
    fireEvent.change(searchInput, { target: { value: 'Boeing' } });
    
    expect(screen.getByText(/Boeing 737-800/i)).toBeInTheDocument();
    expect(screen.queryByText(/Cessna 172 Skyhawk/i)).not.toBeInTheDocument();
  });

  it('shows no results message when search matches nothing', () => {
    renderHome();
    const searchInput = screen.getByPlaceholderText(/Search by model or manufacturer/i);
    
    fireEvent.change(searchInput, { target: { value: 'Spaceship' } });
    
    expect(screen.getByText(/No planes found matching "Spaceship"/i)).toBeInTheDocument();
  });

  it('clears search when clear button is clicked', () => {
    renderHome();
    const searchInput = screen.getByPlaceholderText(/Search by model or manufacturer/i) as HTMLInputElement;
    
    fireEvent.change(searchInput, { target: { value: 'Spaceship' } });
    const clearButton = screen.getByText(/Clear Search/i);
    
    fireEvent.click(clearButton);
    
    expect(searchInput.value).toBe('');
    expect(screen.getByText(/Cessna 172 Skyhawk/i)).toBeInTheDocument();
  });
});
