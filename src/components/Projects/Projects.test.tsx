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

  it('TelegramProSend abre su página de producto sin navegación inmersiva', () => {
    const navigateTo = vi.fn();
    render(
      <NavigationContext.Provider value={navigateTo}>
        <Projects />
      </NavigationContext.Provider>,
    );
    const heading = screen.getByRole('heading', { name: 'TelegramProSend' });
    const card = heading.closest('article')!;
    const caseLink = within(card).getByRole('link', { name: /Ver caso/ });
    expect(caseLink).toHaveAttribute('href', '/productos/telegramprosend/');
    fireEvent.click(caseLink);
    expect(navigateTo).not.toHaveBeenCalled();
  });

  it('las demás tarjetas conservan la navegación inmersiva a contacto', () => {
    const navigateTo = vi.fn();
    render(
      <NavigationContext.Provider value={navigateTo}>
        <Projects />
      </NavigationContext.Provider>,
    );
    const heading = screen.getByRole('heading', { name: 'Terminal de Cobranza' });
    const card = heading.closest('article')!;
    fireEvent.click(within(card).getByRole('link', { name: /Ver caso/ }));
    expect(navigateTo).toHaveBeenCalledWith(5);
  });

  it('TelegramProSend card exposes its download link, other cards do not', () => {
    render(<Projects />);
    const heading = screen.getByRole('heading', { name: 'TelegramProSend' });
    const card = heading.closest('article')!;
    const downloadLink = within(card).getByRole('link', { name: /Descargar TelegramProSend/ });
    expect(downloadLink).toHaveAttribute('href', '/files/TelegramProSend.zip');
    expect(downloadLink).toHaveAttribute('download');
    projects
      .filter((project) => project.id !== 'telegram-pro-send')
      .forEach((project) => {
        const otherHeading = screen.getByRole('heading', { name: project.title });
        const otherCard = otherHeading.closest('article')!;
        expect(within(otherCard).queryByRole('link', { name: /Descargar/ })).not.toBeInTheDocument();
      });
  });
});
