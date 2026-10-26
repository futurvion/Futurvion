export function JobDescription({ text }: { text: string }) {
  return <div className="job-description">{text.split(/\n{2,}/).filter(Boolean).map((block, index) => {
    if (block.startsWith("## ")) return <h3 key={index}>{block.slice(3)}</h3>;
    const lines = block.split("\n");
    if (lines.every(line => line.startsWith("- "))) return <ul key={index}>{lines.map((line, lineIndex) => <li key={lineIndex}>{line.slice(2)}</li>)}</ul>;
    return <p key={index}>{block}</p>;
  })}</div>;
}
