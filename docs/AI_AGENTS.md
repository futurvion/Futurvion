# AI agents and automation

There is **no implemented AI agent, model call, prompt, tool registry, orchestration workflow, agent state, retry policy, evaluation harness, or human-approval flow** in this repository. The `ai-automation` service entry in `data/services.ts` and FAQ copy in `components/home/faq.tsx` describe services Futurvion may offer clients; they do not run AI features on this site. `package.json` has no model-provider SDK dependency.

The site does contain conventional automation: contact email notifications through Resend and event collection through the analytics Route Handler. These are ordinary server workflows documented in [architecture](ARCHITECTURE.md) and [API](API.md), not agents. Any future agent feature needs a separately approved scope, model/provider configuration, data-access permissions, human oversight rules, privacy review, and tests. No such feature is recorded as planned in `TASKS.md`.


Resume matching is deterministic document parsing and ranking, not an autonomous AI agent. It uses no LLM or embedding service, executes no resume instructions, and takes no application action. Employer/provider links continue to handle applications externally. Any future AI integration must first establish the selected provider's approved retention/privacy configuration; the current implementation does not enable one.
