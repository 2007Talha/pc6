import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App.tsx';

describe('App component end-to-end user flows', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
    vi.restoreAllMocks();
  });

  it('renders header, form with landmarks, presets bar, and empty guidance state', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /VayuShield/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
    expect(screen.getByRole('region', { name: /Quick test scenario presets/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Location \/ City/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate VayuShield Guidance/i })).toBeInTheDocument();
    expect(screen.getByText(/Fill in your context above/i)).toBeInTheDocument();
  });

  it('toggles dark and light themes smoothly', () => {
    render(<App />);

    const themeBtn = screen.getByRole('button', { name: /Switch to (dark|light) mode/i });
    expect(themeBtn).toBeInTheDocument();

    fireEvent.click(themeBtn);
    const updatedTheme = document.documentElement.getAttribute('data-theme');
    expect(updatedTheme).toBeTruthy();
  });

  it('validates required location field on submit', async () => {
    render(<App />);

    const submitBtn = screen.getByRole('button', { name: /Generate VayuShield Guidance/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByText(/Location is required/i)).toBeInTheDocument();
    });
  });

  it('loads 1-click test scenario presets and populates context fields', () => {
    render(<App />);

    const delhiPreset = screen.getByRole('button', { name: /Delhi Smog Emergency/i });
    fireEvent.click(delhiPreset);

    const locationInput = screen.getByLabelText(/Location \/ City/i) as HTMLInputElement;
    expect(locationInput.value).toBe('New Delhi, India');

    const scenarioTextarea = screen.getByLabelText(/Custom Scenario/i) as HTMLTextAreaElement;
    expect(scenarioTextarea.value).toContain('Toddler');
  });

  it('submits valid context and renders all 4 structured guidance sections with copy/export', async () => {
    render(<App />);

    const locationInput = screen.getByLabelText(/Location \/ City/i);
    fireEvent.change(locationInput, { target: { value: 'New Delhi' } });

    const submitBtn = screen.getByRole('button', { name: /Generate VayuShield Guidance/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 2, name: /Your Personalized Guidance/i })).toBeInTheDocument();
    });

    // Verify 4 structured output sections exist
    expect(screen.getByRole('heading', { level: 3, name: /Low-Emission Daily Routine/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Indoor Air Quality Hacks/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Sustainable Alternatives/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 3, name: /Quantified Direct Impact/i })).toBeInTheDocument();

    // Verify deterministic engine badge
    expect(screen.getByText(/Deterministic Engine/i)).toBeInTheDocument();

    // Test copy button
    const copyBtn = screen.getByRole('button', { name: /Copy all guidance to clipboard/i });
    expect(copyBtn).toBeInTheDocument();
    fireEvent.click(copyBtn);

    await waitFor(() => {
      expect(screen.getByText(/✓ Copied!/i)).toBeInTheDocument();
    });

    // Test export button
    expect(screen.getByRole('button', { name: /Export guidance as Markdown file/i })).toBeInTheDocument();
  });

  it('resets form and results when reset button is clicked', async () => {
    render(<App />);

    const locationInput = screen.getByLabelText(/Location \/ City/i) as HTMLInputElement;
    fireEvent.change(locationInput, { target: { value: 'Lucknow' } });
    expect(locationInput.value).toBe('Lucknow');

    const resetBtn = screen.getByRole('button', { name: /Reset/i });
    fireEvent.click(resetBtn);

    expect(locationInput.value).toBe('');
    expect(screen.getByText(/Fill in your context above/i)).toBeInTheDocument();
  });
});
