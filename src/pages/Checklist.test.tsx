import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Checklist } from './Checklist';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom';

describe('Checklist Page', () => {
  const renderChecklist = (planeId = 'c172') => {
    render(
      <MemoryRouter initialEntries={[`/checklist/${planeId}`]}>
        <Routes>
          <Route path="/checklist/:planeId" element={<Checklist />} />
        </Routes>
      </MemoryRouter>
    );
  };

  it('renders checklist items for C172', () => {
    renderChecklist();
    expect(screen.getByText(/Cessna 172 Skyhawk Checklist/i)).toBeInTheDocument();
    expect(screen.getByText(/Parking Brake/i)).toBeInTheDocument();
  });

  it('toggles checklist items', () => {
    renderChecklist();
    // Find the item container (role="checkbox") that contains "Parking Brake"
    const label = screen.getByText(/Parking Brake/i);
    const checkbox = label.closest('[role="checkbox"]');
    
    expect(checkbox).toBeInTheDocument();
    expect(checkbox).toHaveAttribute('aria-checked', 'false');
    
    fireEvent.click(checkbox!);
    expect(checkbox).toHaveAttribute('aria-checked', 'true');
  });
});
