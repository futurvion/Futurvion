import type { ProjectConcept } from "@/data/portfolio";

/** Original title studies for the explicitly illustrative portfolio. */
export function ConceptArtwork({ project }: { project: ProjectConcept }) {
  const words = project.title.split(" ");
  return <div className={`concept-art concept-art-${project.slug}`} aria-hidden="true"><span className="concept-art-discipline">{project.category} exploration</span><div className="concept-art-title">{words.map(word => <span key={word}>{word}</span>)}</div><div className="concept-art-foot"><span>{project.industry}</span><span>Futurvion concepts</span></div></div>;
}
