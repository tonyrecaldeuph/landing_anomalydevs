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

  it('TelegramProSend, SMS Pro, Terminal Marketing y Mailer Pro exponen su link de descarga, las demás tarjetas no', () => {
    render(<Projects />);
    const heading = screen.getByRole('heading', { name: 'TelegramProSend' });
    const card = heading.closest('article')!;
    const downloadLink = within(card).getByRole('link', { name: /Descargar TelegramProSend/ });
    expect(downloadLink).toHaveAttribute('href', '/files/TelegramProSend.zip');
    expect(downloadLink).toHaveAttribute('download');
    const smsHeading = screen.getByRole('heading', { name: 'SMS Pro' });
    const smsCard = smsHeading.closest('article')!;
    const smsDownloadLink = within(smsCard).getByRole('link', { name: /Descargar SMS Pro/ });
    expect(smsDownloadLink).toHaveAttribute('href', '/files/SmsProSend-3.0.2.zip');
    expect(smsDownloadLink).toHaveAttribute('download');
    const terminalCard = screen.getByRole('heading', { name: 'Terminal Marketing' }).closest('article')!;
    const terminalDownloadLink = within(terminalCard).getByRole('link', { name: /Descargar Terminal Marketing/ });
    expect(terminalDownloadLink).toHaveAttribute('href', expect.stringMatching(/^https:\/\/crm\.anomalydevs\.qzz\.io\/updates\/.*\.exe$/));
    expect(within(terminalCard).getByText(/Sin licencia/)).toBeInTheDocument();
    const mailerCard = screen.getByRole('heading', { name: 'Mailer Pro' }).closest('article')!;
    const mailerDownloadLink = within(mailerCard).getByRole('link', { name: /Descargar Mailer Pro/ });
    expect(mailerDownloadLink).toHaveAttribute('href', '/files/MailerPro-3.3.1.zip');
    expect(mailerDownloadLink).toHaveAttribute('download');
    projects
      .filter((project) => !['telegram-pro-send', 'sms-pro', 'terminal-marketing', 'mailer-pro'].includes(project.id))
      .forEach((project) => {
        const otherHeading = screen.getByRole('heading', { name: project.title });
        const otherCard = otherHeading.closest('article')!;
        expect(within(otherCard).queryByRole('link', { name: /Descargar/ })).not.toBeInTheDocument();
      });
  });
});
