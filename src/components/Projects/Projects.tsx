import { MouseEvent, useContext } from 'react';
import { projects } from '../../content/projects';
import { NavigationContext, SECTION_INDEX_BY_HASH } from '../../hooks/navigationContext';
import { Reveal } from '../Reveal/Reveal';
import styles from './Projects.module.css';

export function Projects() {
  const navigateTo = useContext(NavigationContext);

  const flyToContact = (e: MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    navigateTo(SECTION_INDEX_BY_HASH['#contacto']);
  };

  return (
    <section id="proyectos" className="section-inner">
      <Reveal>
        <h2>Proyectos</h2>
      </Reveal>
      <div className={styles.grid}>
        {projects.map((project) => (
          <article className={styles.card} key={project.id}>
            <div className={styles.thumb}>
              <img
                src={project.image}
                alt={`Captura de pantalla del proyecto ${project.title}`}
                className={styles.thumbImage}
              />
            </div>
            <div className={styles.body}>
              <h3>{project.title}</h3>
              <p className={styles.description}>{project.description}</p>
              <div className={styles.tags}>
                {project.tags.map((tag) => (
                  <span className={styles.tag} key={tag}>{tag}</span>
                ))}
              </div>
              <a href="#contacto" className={styles.caseLink} onClick={flyToContact}>Ver caso &rarr;</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
