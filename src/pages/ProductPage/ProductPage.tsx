import { lazy, Suspense } from 'react';
import type { ProductPageContent } from '../../content/products/telegramProSend';
import { BrandMark } from '../../components/BrandMark/BrandMark';
import { Footer } from '../../components/Footer/Footer';
import { SECTIONS } from '../../three/clusterConfig';
import styles from './ProductPage.module.css';

const ImmersiveCanvas = lazy(() =>
  import('../../components/ImmersiveCanvas/ImmersiveCanvas').then((m) => ({
    default: m.ImmersiveCanvas,
  })),
);

function resolveProductCluster(): number {
  const index = SECTIONS.findIndex((section) => section.id === 'projects');
  return index < 0 ? 0 : index;
}

const PRODUCT_CLUSTER = resolveProductCluster();

const STATUS_ICONS: Record<string, string> = {
  Enviado: '✅',
  'Sin Telegram': '⚪',
  Error: '❌',
};

function statusIcon(status: string): string {
  return STATUS_ICONS[status] ?? '•';
}

interface ProductPageProps {
  content: ProductPageContent;
}

export function ProductPage({ content }: ProductPageProps) {
  return (
    <>
      <Suspense fallback={null}>
        <ImmersiveCanvas activeCluster={PRODUCT_CLUSTER} />
      </Suspense>
      <div className={styles.page}>
      <header className={styles.topbar}>
        <a href="/" className={styles.brand} aria-label="AnomalyDevs — inicio">
          <BrandMark className={styles.mark} />
          <span className={styles.wordmark}>AnomalyDevs</span>
        </a>
        <a href="/#proyectos" className={styles.backLink}>
          ← Volver a proyectos
        </a>
      </header>

      <main className={styles.main}>
        <section className={styles.hero} aria-labelledby="product-title">
          <p className={styles.kicker}>Extensión de Chrome · Telegram</p>
          <h1 id="product-title">{content.name}</h1>
          <p className={styles.tagline}>{content.tagline}</p>
          <p className={styles.summary}>{content.summary}</p>
          <div className={styles.heroActions}>
            <a href={content.download.href} download className={styles.downloadButton}>
              {content.download.label} <span aria-hidden="true">↓</span>
            </a>
            <p className={styles.licenseNote}>
              {content.download.note} ·{' '}
              <a href={content.licenseCtaHref} className={styles.licenseLink}>
                Solicitar licencia →
              </a>
            </p>
          </div>
        </section>

        <section aria-labelledby="que-es">
          <h2 id="que-es">Qué es</h2>
          <div className={styles.featureGrid}>
            {content.features.map((feature) => (
              <article key={feature.title} className={styles.featureCard}>
                <h3>{feature.title}</h3>
                <p>{feature.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="requisitos">
          <h2 id="requisitos">Requisitos</h2>
          <ul className={styles.list}>
            {content.requirements.map((requirement) => (
              <li key={requirement}>{requirement}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="guia-instalacion">
          <h2 id="guia-instalacion">Guía de instalación</h2>
          <ol className={styles.steps}>
            {content.installSteps.map((step) => (
              <li key={step}>{step}</li>
            ))}
          </ol>
          <h3>Activar la licencia</h3>
          <div className={styles.licenseBlock}>
            <ol className={styles.steps}>
              {content.licenseSteps.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
            <a href={content.licenseImage} target="_blank" rel="noopener">
              <img
                src={content.licenseImage}
                alt={content.licenseImageAlt}
                loading="lazy"
                className={styles.shot}
              />
            </a>
          </div>
        </section>

        <section aria-labelledby="guia-uso">
          <h2 id="guia-uso">Guía de uso</h2>
          <ol className={styles.usageList}>
            {content.usageSteps.map((step, index) => (
              <li key={step.title} className={styles.usageStep}>
                <div className={styles.usageText}>
                  <h3>
                    <span className={styles.stepNumber} aria-hidden="true">
                      {index + 1}.{' '}
                    </span>
                    {step.title}
                  </h3>
                  <p>{step.text}</p>
                </div>
                {step.image && (
                  <a href={step.image} target="_blank" rel="noopener">
                    <img
                      src={step.image}
                      alt={step.imageAlt ?? step.title}
                      loading="lazy"
                      className={styles.shot}
                    />
                  </a>
                )}
              </li>
            ))}
          </ol>
        </section>

        <section aria-labelledby="resultados">
          <h2 id="resultados">Resultados</h2>
          <div className={styles.resultGrid}>
            {content.results.map((result) => (
              <article key={result.status} className={styles.resultCard}>
                <h3>
                  <span aria-hidden="true">{statusIcon(result.status)} </span>
                  {result.status}
                </h3>
                <p>{result.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section aria-labelledby="buenas-practicas">
          <h2 id="buenas-practicas">Buenas prácticas</h2>
          <ul className={styles.list}>
            {content.tips.map((tip) => (
              <li key={tip}>{tip}</li>
            ))}
          </ul>
        </section>

        <section aria-labelledby="faq">
          <h2 id="faq">Preguntas frecuentes</h2>
          {content.faq.map((entry) => (
            <details key={entry.question} className={styles.faqItem}>
              <summary>{entry.question}</summary>
              <p>{entry.answer}</p>
            </details>
          ))}
        </section>

        <section aria-labelledby="cta-final" className={styles.finalCta}>
          <h2 id="cta-final">Descarga TelegramProSend</h2>
          <div className={styles.heroActions}>
            <a href={content.download.href} download className={styles.downloadButton}>
              {content.download.label} <span aria-hidden="true">↓</span>
            </a>
            <p className={styles.licenseNote}>
              {content.download.note} ·{' '}
              <a href={content.licenseCtaHref} className={styles.licenseLink}>
                Solicitar licencia →
              </a>
            </p>
          </div>
          <p className={styles.support}>
            Soporte:{' '}
            <a href={`mailto:${content.supportEmail}`}>{content.supportEmail}</a>
          </p>
        </section>
      </main>

      <Footer />
      </div>
    </>
  );
}
