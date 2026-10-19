const faq = [
  ["What services does Futurvion offer?", "We bring together brand strategy and identity, websites, applications, custom software, automation, marketing, and technology consulting. The right mix depends on your goals."],
  ["Can you help a business starting from zero?", "Yes. Discovery can begin with your idea, audience, and immediate priorities, then define a practical first phase."],
  ["Can you manage branding and software together?", "Yes. An integrated project can align how the business presents itself with the digital systems it uses. Scope is agreed during discovery."],
  ["Can you build software for our operations?", "We can assess your workflow and design a custom system when existing tools do not fit. In the first conversations we work out who will use it, which tools it needs to connect with, how to keep it secure, and how it will be looked after."],
  ["Can you improve a website or app we already have?", "Yes. We can look at what you have today and recommend small fixes or a fresh start, based on its condition and goals."],
  ["Can you use AI and automation for us?", "Where it makes sense. We look for a specific use case, check what information is involved and where a person should stay in the loop, and choose tools that fit the task."],
  ["How does project discovery work?", "We discuss your objectives, audience, current tools, constraints, and priorities. That gives us a basis for a proposed scope and next steps."],
  ["How are projects scoped and priced?", "Scope and pricing depend on the work involved. After discovery, we can outline deliverables, assumptions, and an approach for your review."],
  ["Do you offer ongoing maintenance?", "Ongoing support can be discussed and included in a project agreement where needed."],
  ["How can I start a project?", "Use the contact form or email us with a brief description of your goals. We can then discuss the most useful next step."],
];
export function FAQ() { return <div className="faq-list">{faq.map(([question, answer], i) => <details key={question}><summary><span className="faq-number">{String(i + 1).padStart(2, "0")}</span><span>{question}</span><span className="faq-plus" aria-hidden="true">+</span></summary><p>{answer}</p></details>)}</div>; }
