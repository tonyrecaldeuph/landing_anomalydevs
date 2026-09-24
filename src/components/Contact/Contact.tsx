import { FormEvent, useState } from 'react';
import { contactContent } from '../../content/contact';
import { Reveal } from '../Reveal/Reveal';
import styles from './Contact.module.css';

export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

type SubmitStatus = 'idle' | 'sending' | 'success' | 'error';

const EMPTY: ContactFormValues = { name: '', email: '', message: '' };

export function Contact() {
  const [values, setValues] = useState<ContactFormValues>(EMPTY);
  const [website, setWebsite] = useState('');
  const [status, setStatus] = useState<SubmitStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (status === 'sending') return;
    if (!values.name || !values.email || !values.message) {
      setError('Completa todos los campos antes de enviar.');
      return;
    }
    setError(null);
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...values, website }),
      });
      const data: { ok?: boolean; error?: string } | null = await res.json().catch(() => null);
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? null);
        setStatus('error');
        return;
      }
      setStatus('success');
      setValues(EMPTY);
    } catch {
      setStatus('error');
    }
  }

  return (
    <section id="contacto" className={`section-inner ${styles.contact}`}>
      <div className={styles.intro}>
        <span className={styles.kicker}>
          <span className={styles.kickerIndex}>{'// 05'}</span> iniciar protocolo
        </span>
        <Reveal>
          <h2 className={styles.heading}>{contactContent.heading}</h2>
        </Reveal>
        <p className={styles.lead}>
          Cuéntanos qué no encaja. Respondemos en menos de 24 horas con un diagnóstico inicial, sin costo.
        </p>
        <ul className={styles.channels}>
          <li className={styles.channel}>
            <span className={styles.channelLabel}>Email</span>
            <a href={`mailto:${contactContent.email}`}>{contactContent.email}</a>
          </li>
          <li className={styles.channel}>
            <span className={styles.channelLabel}>Teléfono</span>
            <a href={`tel:${contactContent.phone.replace(/\s+/g, '')}`}>{contactContent.phone}</a>
          </li>
          <li className={styles.channel}>
            <span className={styles.channelLabel}>Base</span>
            <span>Ecuador · remoto LATAM</span>
          </li>
        </ul>
      </div>

      <div className={styles.terminal}>
        <div className={styles.titlebar} aria-hidden="true">
          <i /> <i /> <i />
          <span>nuevo_proyecto.sh</span>
        </div>
        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.field}>
            <label htmlFor="contact-name">Nombre</label>
            <input
              id="contact-name"
              required
              autoComplete="name"
              placeholder="Tu nombre"
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              type="email"
              required
              autoComplete="email"
              placeholder="tu@empresa.com"
              value={values.email}
              onChange={(e) => setValues({ ...values, email: e.target.value })}
            />
          </div>
          <div className={styles.field}>
            <label htmlFor="contact-message">Mensaje</label>
            <textarea
              id="contact-message"
              rows={4}
              required
              placeholder="Describe la anomalía que quieres resolver…"
              value={values.message}
              onChange={(e) => setValues({ ...values, message: e.target.value })}
            />
          </div>
          {/* Honeypot: invisible para humanos; los bots lo rellenan y el servidor los descarta. */}
          <div className={styles.honeypot} aria-hidden="true">
            <label htmlFor="contact-website">Sitio web</label>
            <input
              id="contact-website"
              tabIndex={-1}
              autoComplete="off"
              value={website}
              onChange={(e) => setWebsite(e.target.value)}
            />
          </div>
          {error && <p className={styles.error}>{error}</p>}
          {status === 'error' && !error && (
            <p className={styles.error}>
              No se pudo enviar el mensaje. Intenta de nuevo o escríbenos al correo.
            </p>
          )}
          {status === 'success' && (
            <p className={styles.success} role="status">
              ¡Mensaje enviado! Te contactaremos pronto.
            </p>
          )}
          <button className={styles.submit} type="submit" disabled={status === 'sending'} data-status={status}>
            {status === 'sending' ? 'Enviando…' : 'Enviar'}
          </button>
        </form>
      </div>
    </section>
  );
}
