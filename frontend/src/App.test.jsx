import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import App from './App.jsx';
import { AuthContext } from './lib/auth.jsx';

test('renders Requests navigation button', () => {
  const authValue = {
    user: { id: 1, email: 'user@example.com', role: 'admin' },
    status: 'authenticated',
    setSession: () => {},
    logout: () => {},
    bootstrap: () => {},
  };

  render(
    <AuthContext.Provider value={authValue}>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </AuthContext.Provider>
  );
  const requestLinks = screen.getAllByRole('link', { name: /requests/i });
  expect(requestLinks.length).toBeGreaterThan(0);
});
