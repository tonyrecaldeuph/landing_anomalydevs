import { MouseEvent, useContext } from 'react';
import { projects } from '../../content/projects';
import { NavigationContext, SECTION_INDEX_BY_HASH } from '../../hooks/navigationContext';
import { SectionHeading } from '../SectionHeading/SectionHeading';
import { TiltCard } from '../TiltCard/TiltCard';
import styles from './Projects.module.css';

function lowerFirst(value: string): string {
  return value.charAt(0).toLowerCase() + value.slice(1);
}

export function Projects() {
  const navigateTo = useContext(NavigationContext);

  const flyToContact = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateTo(SECTION_INDEX_BY_HASH['#contacto']);
  };

  return (
    <section id="proyectos" className="section-inner">
      <SectionHeading index={3} kicker="casos reales en producción" title="Proyectos" />
      <div className={styles.grid}>
        {projects.map((project, i) => (
          <TiltCard className={styles.card} key={project.id} maxDeg={5}>
            <div className={styles.thumb}>
              <img
                src={project.image}
                alt={`Captura de pantalla del proyecto ${project.title}`}
                className={styles.thumbImage}
              />
              <span className={styles.thumbGrid} aria-hidden="true" />
              <span className={styles.thumbTag} aria-hidden="true">
                {`CASO_${String(i + 1).padStart(2, '0')}`}
              </span>
            </div>
            <div className={styles.body}>
              <h3>{project.title}</h3>
              <p className={styles.description}>{project.description}</p>
              <div className={styles.tags}>
                {project.tags.map((tag) => (
                  <span className={styles.tag} key={tag}>{tag}</span>
                ))}
              </div>
              <div className={styles.actions}>
                <a href="#contacto" className={styles.caseLink} onClick={flyToContact}>
                  Ver caso <span aria-hidden="true">→</span>
                </a>
                {project.download && (
                  <a
                    href={project.download.href}
                    download
                    className={styles.downloadLink}
                    aria-label={`Descargar ${project.title} (${lowerFirst(project.download.note)})`}
                  >
                    {project.download.label} <span aria-hidden="true">↓</span>
                  </a>
                )}
              </div>
              {project.download && (
                <p className={styles.downloadNote}>{project.download.note}</p>
              )}
            </div>
          </TiltCard>
        ))}
      </div>
    </section>
  );
}
