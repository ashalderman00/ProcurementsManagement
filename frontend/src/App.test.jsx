import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from './App.jsx';

test('renders greeting', () => {
  render(<App />);
  expect(screen.getByText(/Hello World from frontend!/i)).toBeInTheDocument();
});
