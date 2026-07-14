import { FormEvent, useState } from 'react';
import { contactContent } from '../../content/contact';
import { Reveal } from '../Reveal/Reveal';
import styles from './Contact.module.css';

export interface ContactFormValues {
  name: string;
  email: string;
  message: string;
}

interface ContactProps {
  onSubmit?: (values: ContactFormValues) => void;
}

export function Contact({ onSubmit }: ContactProps) {
  const [values, setValues] = useState<ContactFormValues>({ name: '', email: '', message: '' });
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!values.name || !values.email || !values.message) {
      setError('Completa todos los campos antes de enviar.');
      return;
    }
    setError(null);
    onSubmit?.(values);
  }

  return (
    <section id="contacto" className={`section-inner ${styles.contact}`}>
      <Reveal>
        <h2>{contactContent.heading}</h2>
      </Reveal>
      <div className={styles.links}>
        <a href={`mailto:${contactContent.email}`}>{contactContent.email}</a>
        <a href={`tel:${contactContent.phone.replace(/\s+/g, '')}`}>{contactContent.phone}</a>
      </div>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <div className={styles.field}>
          <label htmlFor="contact-name">Nombre</label>
          <input
            id="contact-name"
            required
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
            value={values.message}
            onChange={(e) => setValues({ ...values, message: e.target.value })}
          />
        </div>
        {error && <p className={styles.error}>{error}</p>}
        <button className={styles.submit} type="submit">Enviar</button>
      </form>
    </section>
  );
}
