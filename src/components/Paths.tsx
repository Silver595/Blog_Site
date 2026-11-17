import { Link, useParams } from 'react-router';
import { articles } from '../content';
import { buildIndex, buildLearningPaths } from '../lib/library.mjs';

const paths = buildLearningPaths(buildIndex(articles));

export default function Paths() {
  const { slug } = useParams();
  const current = slug === undefined ? undefined : paths.find(path => path.slug === slug);
  if (slug !== undefined && !current) {
    return <main id="main" className="not-found"><span>ERROR 404</span><h1>PATH NOT FOUND.</h1><Link to="/paths">BROWSE LEARNING PATHS</Link></main>;
  }
  if (!current) return <main id="main" className="paths-page">
    <p className="eyebrow">STRUCTURED LEARNING</p>
    <h1 className="paths-heading">LEARNING PATHS.</h1>
    <p className="paths-intro">Follow lessons in a deliberate order, from underlying concepts to practical investigation. Paths are assembled from published notes, not a private vault.</p>
    <div className="paths-grid">
      {paths.map(path => <Link className="path-card" key={path.slug} to={`/paths/${path.slug}`}>
        <div><span className="eyebrow">LEARNING SEQUENCE</span><h2>{path.title}</h2></div>
        <div><p className="path-meta">{path.lessons.length} {path.lessons.length === 1 ? 'LESSON' : 'LESSONS'}</p><span className="path-action">EXPLORE PATH ↗</span></div>
      </Link>)}
    </div>
    {!paths.length && <p className="path-empty">No learning paths published yet. Add learningPath and lesson metadata to approved articles.</p>}
  </main>;
  return <main id="main" className="paths-page">
    <Link className="path-detail-back" to="/paths">← ALL LEARNING PATHS</Link>
    <p className="eyebrow" style={{marginTop:42}}>CURATED SEQUENCE</p>
    <h1 className="paths-heading">{current.title}</h1>
    <p className="paths-intro">Work through these lessons in order. Each lesson opens as a regular article, with its original shareable URL.</p>
    <p className="path-detail-meta">{current.lessons.length} {current.lessons.length === 1 ? 'LESSON' : 'LESSONS'}</p>
    <ol className="path-lesson-list">{current.lessons.map((lesson, index) =>
      <li key={lesson.slug}><Link to={`/posts/${lesson.slug}`}>
        <span className="path-lesson-index">{String(index+1).padStart(2,'0')}</span>
        <span className="path-lesson-copy"><strong>{lesson.title}</strong><small>{lesson.description}</small></span>
        <span className="path-lesson-duration" aria-hidden="true">↗</span>
      </Link></li>)}</ol>
    <Link className="path-detail-back" to="/paths">← ALL LEARNING PATHS</Link>
  </main>;
}
