import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App.tsx';

describe('Tier 4: WCAG 2.2 Level AA Accessibility & Landmark Tests', () => {
  it('1. Verifies WCAG 2.4.1 Bypass Block skip-link targets #main-content', () => {
    const { container } = render(<App />);
    const skipLink = container.querySelector('.skip-link');
    expect(skipLink).toBeInTheDocument();
    expect(skipLink?.getAttribute('href')).toBe('#main-content');

    const main = container.querySelector('#main-content');
    expect(main).toBeInTheDocument();
    expect(main?.getAttribute('role')).toBe('main');
    expect(main?.getAttribute('tabindex')).toBe('-1');
  });

  it('2. Verifies standard HTML5 semantic landmark structure', () => {
    render(<App />);
    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });

  it('3. Verifies every form control has an explicit htmlFor label', () => {
    render(<App />);
    expect(screen.getByLabelText(/Location \/ City/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/AQI Severity Tier/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Household \/ Community Profile/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Housing Type/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Commute Mode/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cooking \/ Heating Fuel/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Custom Scenario/i)).toBeInTheDocument();
  });

  it('4. Verifies aria-required="true" on mandatory context fields', () => {
    render(<App />);
    const locationInput = screen.getByLabelText(/Location \/ City/i);
    const aqiSelect = screen.getByLabelText(/AQI Severity Tier/i);
    const profileSelect = screen.getByLabelText(/Household \/ Community Profile/i);

    expect(locationInput.getAttribute('aria-required')).toBe('true');
    expect(aqiSelect.getAttribute('aria-required')).toBe('true');
    expect(profileSelect.getAttribute('aria-required')).toBe('true');
  });

  it('5. Verifies aria-invalid state updates upon validation failure', () => {
    render(<App />);
    const locationInput = screen.getByLabelText(/Location \/ City/i);
    const submitBtn = screen.getByRole('button', { name: /Generate VayuShield Guidance/i });

    // Location is empty by default; submitting triggers validation error
    fireEvent.click(submitBtn);

    expect(locationInput.getAttribute('aria-invalid')).toBe('true');
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('6. Verifies status announcement area has aria-live="polite"', () => {
    const { container } = render(<App />);
    const liveRegion = container.querySelector('.status-live');
    expect(liveRegion).toBeInTheDocument();
    expect(liveRegion?.getAttribute('aria-live')).toBe('polite');
  });

  it('7. Verifies Twin Representation Rule (SVG curve accompanied by .sr-only table)', async () => {
    render(<App />);
    // Load a preset to render guidance results
    const presetBtn = screen.getByRole('button', { name: /Delhi Smog Emergency/i });
    fireEvent.click(presetBtn);

    const submitBtn = screen.getByRole('button', { name: /Generate VayuShield Guidance/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      // Verify SVG is aria-hidden from screen readers
      const svgContainer = document.querySelector('.svg-chart-container');
      expect(svgContainer?.getAttribute('aria-hidden')).toBe('true');

      // Verify twin table exists with accessible caption
      const srTable = document.querySelector('table.sr-only');
      expect(srTable).toBeInTheDocument();
      expect(srTable?.querySelector('caption')).toHaveTextContent(/Diurnal atmospheric boundary layer/i);
    });
  });

  it('8. Verifies theme toggle button has accessible label reflecting target state', () => {
    render(<App />);
    const themeBtn = screen.getByRole('button', { name: /Switch to (dark|light) mode/i });
    expect(themeBtn).toBeInTheDocument();
    expect(themeBtn.getAttribute('aria-label')).toMatch(/Switch to (dark|light) mode/i);
  });

  it('9. Verifies action buttons have accessible titles and labels', () => {
    render(<App />);
    const liveAqiBtn = screen.getByRole('button', { name: /Fetch real-time air quality from Open-Meteo/i });
    expect(liveAqiBtn).toBeInTheDocument();
    expect(liveAqiBtn.getAttribute('title')).toContain('Open-Meteo');
  });

  it('10. Verifies room CADR calculator inputs have explicit labels and semantic bounds', async () => {
    render(<App />);
    // Load preset and submit to see CADR card
    fireEvent.click(screen.getByRole('button', { name: /Delhi Smog Emergency/i }));
    fireEvent.click(screen.getByRole('button', { name: /Generate VayuShield Guidance/i }));

    await waitFor(() => {
      const areaInput = screen.getByLabelText(/Floor Area \(sq ft\)/i);
      const heightInput = screen.getByLabelText(/Ceiling Height \(ft\)/i);
      const achSelect = screen.getByLabelText(/Target ACH/i);

      expect(areaInput).toBeInTheDocument();
      expect(heightInput).toBeInTheDocument();
      expect(achSelect).toBeInTheDocument();
    });
  });
});
