import { render, screen, within } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Projects } from './Projects';
import { projects } from '../../content/projects';

describe('Projects', () => {
  it('renders one card per project with title and all its tags', () => {
    render(<Projects />);
    projects.forEach((project) => {
      const heading = screen.getByRole('heading', { name: project.title });
      expect(heading).toBeInTheDocument();
      const card = heading.closest('article')!;
      project.tags.forEach((tag) => {
        expect(within(card).getByText(tag)).toBeInTheDocument();
      });
    });
  });
});
