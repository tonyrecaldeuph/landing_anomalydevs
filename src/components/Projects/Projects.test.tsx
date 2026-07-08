import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Projects } from './Projects';
import { projects } from '../../content/projects';

describe('Projects', () => {
  it('renders one card per project with title and all its tags', () => {
    render(<Projects />);
    projects.forEach((project) => {
      expect(screen.getByRole('heading', { name: project.title })).toBeInTheDocument();
      project.tags.forEach((tag) => {
        expect(screen.getAllByText(tag).length).toBeGreaterThan(0);
      });
    });
  });
});
