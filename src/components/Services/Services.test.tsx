import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Services } from './Services';
import { services } from '../../content/services';

describe('Services', () => {
  it('renders one card per service with title and description', () => {
    render(<Services />);
    services.forEach((service) => {
      expect(screen.getByRole('heading', { name: service.title })).toBeInTheDocument();
      expect(screen.getByText(service.description)).toBeInTheDocument();
    });
  });
});
