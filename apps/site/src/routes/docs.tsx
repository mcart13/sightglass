const docsSections = [
  {
    title: "Why this is not Figma",
    body:
      "Sightglass edits the running product surface. The target is a live DOM node with a stable runtime anchor, not a detached canvas object. That distinction matters because every change can be replayed, scoped, critiqued, exported, and restored against the real app.",
  },
  {
    title: "Why this is not a prompt toy",
    body:
      "The product stores deterministic transactions and machine-readable manifests. Prompts are downstream artifacts generated from explicit state, not the source of truth for what changed.",
  },
  {
    title: "Why critique and exploration belong next to editing",
    body:
      "Critique is only useful if it turns into action. Sightglass keeps structured findings, design directions, motion analysis, and live controls in the same session so the user can inspect, change, compare, and export without context loss.",
  },
  {
    title: "Why motion tuning is first-class",
    body:
      "Motion gets judged both for feel and pipeline cost. The motion lab keeps reduced-motion checks, timing guidance, and performance warnings tied to the same target the user is editing.",
  },
];

const releaseSteps = [
  "Draft a changeset for any publishable package change.",
  "Run `yarn version:packages` to apply versions from pending changesets.",
  "Review generated version diffs and changelog notes before opening package manifests for publish.",
  "Publish with `yarn release:packages` once registry credentials are available and package privacy is intentionally relaxed.",
];

export const DocsRoute = (): React.JSX.Element => (
  <div className="section-grid">
    <section className="panel site-section">
      <span className="eyebrow">
        <span className="accent-dot" aria-hidden="true" />
        Workflow docs
      </span>
      <h1 className="route-heading">A transactional design workflow for the real UI.</h1>
      <p className="route-intro">
        The operational model is simple: select a real target, inspect semantic
        scope, apply explicit edits, critique the result, explore stronger directions,
        and export the review session from the same local state.
      </p>
    </section>

    <section className="panel site-section">
      <div className="section-grid two-up">
        {docsSections.map((section) => (
          <article className="note-card" key={section.title}>
            <h2>{section.title}</h2>
            <p>{section.body}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="panel site-section">
      <span className="eyebrow">
        <span className="accent-dot" aria-hidden="true" />
        Transaction model
      </span>
      <div className="section-grid two-up" style={{ alignItems: "start" }}>
        <div className="note-card">
          <h2>Live edit loop</h2>
          <p>
            A selection becomes a target anchor. Edits are recorded as transactions
            with scope, semantic kind, original value, and current value. Undo, redo,
            revert, and restore all operate on the same transaction history.
          </p>
        </div>
        <pre className="docs-snippet">{`{
  "target": {
    "selector": "[data-testid='fixture-card-primary']",
    "runtimeId": "article:fixture-card-primary"
  },
  "transactions": [
    {
      "scope": "similar",
      "semanticKind": "token",
      "property": "borderRadius",
      "from": "18px",
      "to": "var(--sg-radius-xl)"
    }
  ],
  "exports": ["manifest", "agent-prompt", "review-artifact"]
}`}</pre>
      </div>
    </section>

    <section className="panel site-section">
      <span className="eyebrow">
        <span className="accent-dot" aria-hidden="true" />
        Publishing flow
      </span>
      <div className="workflow-list" style={{ marginTop: 18 }}>
        {releaseSteps.map((step) => (
          <article className="workflow-step" key={step}>
            <p>{step}</p>
          </article>
        ))}
      </div>
    </section>
  </div>
);
