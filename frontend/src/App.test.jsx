import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { describe, it, expect } from 'vitest';
import App from './App.jsx';

describe('App', () => {
  it('renders greeting', () => {
    render(<App />);
    expect(screen.getByText('Hello World from frontend!')).toBeInTheDocument();
  });
});
