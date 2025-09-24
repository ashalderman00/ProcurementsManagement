import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';

vi.mock('../lib/api', () => ({
  apiGet: vi.fn(),
}));

import Landing from './Landing.jsx';
import { apiGet } from '../lib/api';

describe('Landing role selector', () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test('falls back to template role views when marketing data is unavailable', async () => {
    apiGet.mockRejectedValue(new Error('network error'));
    const consoleError = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    render(<Landing />);

    const roleSelect = await screen.findByLabelText(/role/i);
    await waitFor(() => expect(roleSelect).not.toBeDisabled());
    await waitFor(() => expect(roleSelect.value).toBe('admin'));

    expect(
      await screen.findByRole('heading', {
        name: /keep automations and access running/i,
      })
    ).toBeInTheDocument();

    expect(
      screen.getByText(
        /live workspace data couldn't load, so you're seeing the standard program playbook\./i
      )
    ).toBeInTheDocument();

    expect(
      await screen.findByText(
        /live workspace metrics couldn't load, so we've surfaced direct links into the core queues\./i
      )
    ).toBeInTheDocument();

    expect(
      screen.getAllByText(
        /live focus signals are unavailable, so start with these quick entry points and share updates in stand-up\./i
      )[0]
    ).toBeInTheDocument();

    expect(consoleError).toHaveBeenCalled();
    consoleError.mockRestore();
  });
});
