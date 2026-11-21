import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { App } from '../App.tsx';

describe('App component end-to-end user flows', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders header, form with landmarks, and empty guidance state', () => {
    render(<App />);

    expect(screen.getByRole('banner')).toBeInTheDocument();
    expect(screen.getByRole('heading', { level: 1, name: /VayuShield/i })).toBeInTheDocument();
    expect(screen.getByRole('main')).toBeInTheDocument();
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

  it('submits valid context and renders all 4 structured guidance sections', async () => {
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

    // Verify export buttons
    expect(screen.getByRole('button', { name: /Copy all guidance to clipboard/i })).toBeInTheDocument();
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
