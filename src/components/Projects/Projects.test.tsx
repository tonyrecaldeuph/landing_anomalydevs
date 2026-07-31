import { render, screen, within, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { Projects } from './Projects';
import { projects } from '../../content/projects';
import { NavigationContext } from '../../hooks/navigationContext';

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

  it('Ver caso navigates to the contact cluster (5)', () => {
    const navigateTo = vi.fn();
    render(
      <NavigationContext.Provider value={navigateTo}>
        <Projects />
      </NavigationContext.Provider>,
    );
    fireEvent.click(screen.getAllByRole('link', { name: /Ver caso/ })[0]);
    expect(navigateTo).toHaveBeenCalledWith(5);
  });
});
