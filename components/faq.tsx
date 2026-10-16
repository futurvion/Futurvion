const faq = [
  ["What services does Futurvion offer?", "We bring together brand strategy and identity, websites, applications, custom software, automation, marketing, and technology consulting. The right mix depends on your goals."],
  ["Can you help a business starting from zero?", "Yes. Discovery can begin with your idea, audience, and immediate priorities, then define a practical first phase."],
  ["Can you manage branding and software together?", "Yes. An integrated project can align how the business presents itself with the digital systems it uses. Scope is agreed during discovery."],
  ["Can you build software for our operations?", "We can assess your workflow and design a custom system when existing tools do not fit. The discovery phase clarifies users, integrations, security, and maintenance needs."],
  ["Do you work with existing websites or applications?", "Yes. We can review an existing platform and recommend targeted improvements or a more substantial rebuild, based on its condition and goals."],
  ["Can you integrate AI and automation?", "Where it makes sense. We look for a specific use case, review data and human oversight needs, and choose tools that fit the task."],
  ["How does project discovery work?", "We discuss your objectives, audience, current tools, constraints, and priorities. That gives us a basis for a proposed scope and next steps."],
  ["How are projects scoped and priced?", "Scope and pricing depend on the work involved. After discovery, we can outline deliverables, assumptions, and an approach for your review."],
  ["Do you offer ongoing maintenance?", "Ongoing support can be discussed and included in a project agreement where needed."],
  ["How can I start a project?", "Use the contact form or email us with a brief description of your goals. We can then discuss the most useful next step."],
];
export function FAQ() { return <div className="faq-list">{faq.map(([question, answer], i) => <details key={question}><summary><span className="faq-number">{String(i + 1).padStart(2, "0")}</span><span>{question}</span><span className="faq-plus" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>; }
