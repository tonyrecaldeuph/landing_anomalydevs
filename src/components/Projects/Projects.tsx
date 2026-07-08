import { projects } from '../../content/projects';
import styles from './Projects.module.css';

export function Projects() {
  return (
    <section id="proyectos" className="section-inner">
      <h2>Proyectos</h2>
      <div className={styles.grid}>
        {projects.map((project) => (
          <article className={styles.card} key={project.id}>
            <div className={styles.thumb} aria-hidden="true" />
            <div className={styles.body}>
              <h3>{project.title}</h3>
              <p className={styles.description}>{project.description}</p>
              <div className={styles.tags}>
                {project.tags.map((tag) => (
                  <span className={styles.tag} key={tag}>{tag}</span>
                ))}
              </div>
              <a href="#contacto" className={styles.caseLink}>Ver caso &rarr;</a>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
