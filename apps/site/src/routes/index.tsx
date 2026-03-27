const capabilityHighlights = [
  "Live editing inside the running app",
  "Semantic scopes before raw CSS",
  "Critique with source-labeled findings",
  "Explore mode for stronger redesign directions",
  "Motion lab with reduced-motion and pipeline checks",
  "Session review export built on a machine-readable manifest",
];

const featureCards = [
  {
    title: "Edit the real surface",
    body:
      "Sightglass works on the running DOM instead of asking a designer or model to reimagine the interface from scratch. Every change is a structured transaction with scope, original value, current value, and semantic hints.",
  },
  {
    title: "Stay design-system-aware",
    body:
      "The editing flow starts with tokens, repeated patterns, and scope choices like this node, siblings, similar elements, or component matches. Raw CSS is still available, but it is the fallback rather than the first move.",
  },
  {
    title: "Keep critique next to action",
    body:
      "Critique, exploration, and motion tuning sit beside the live editor because they are part of the same design loop: inspect the surface, understand what is weak, generate stronger directions, and apply structured edits immediately.",
  },
  {
    title: "Review with local sessions",
    body:
      "Named sessions, snapshots, undo history, critique summaries, and export artifacts all stay local-first. The review artifact is self-contained and built from the same machine-readable manifest used for automation.",
  },
];

const workflowSteps = [
  {
    title: "1. Select the real target",
    body:
      "The overlay chooses a stable runtime anchor and exposes semantic controls when the system can infer intent.",
  },
  {
    title: "2. Apply explicit transactions",
    body:
      "Each mutation is grouped, reversible, and exportable. There is no hidden prompt chain standing in for product logic.",
  },
  {
    title: "3. Run critique and exploration",
    body:
      "Structured findings stay source-labeled. Explore mode turns that critique into concrete redesign directions and scoped edit plans.",
  },
  {
    title: "4. Save the review session",
    body:
      "The same session captures history, critique, export text, and machine-readable artifacts for engineers, designers, and PMs.",
  },
];

const packageCards = [
  {
    name: "@sightglass/core",
    body: "Headless target inspection, transactional edits, text operations, and the shared contracts.",
  },
  {
    name: "@sightglass/react",
    body: "Provider, overlay shell, editor panels, critique controls, and review-draft state wired to the core engine.",
  },
  {
    name: "@sightglass/critique",
    body: "Structured critique lenses, perspective weighting, exploration directions, motion guidance, and tuneable motion schemas.",
  },
  {
    name: "@sightglass/export",
    body: "Deterministic change manifests, agent-ready prompts, critique summaries, and review artifact formatting.",
  },
  {
    name: "@sightglass/session",
    body: "Local-first session records, review snapshots, applied-state serialization, and restore flows.",
  },
];

export const HomeRoute = (): React.JSX.Element => (
  <div className="section-grid">
    <section className="hero-grid">
      <div className="panel hero-copy">
        <span className="eyebrow">
          <span className="accent-dot" aria-hidden="true" />
          A design copilot for the real app, not a screenshot toy
        </span>
        <h1>Sightglass turns critique into live, reversible UI edits.</h1>
        <p>
          This is not Figma in the browser and it is not a prompt toy. Sightglass
          sits on the running interface, records deterministic transactions, and
          keeps critique, exploration, motion tuning, and review export in the
          same local-first workflow.
        </p>
        <div className="hero-actions">
          <a className="cta-primary" href="http://127.0.0.1:4173">
            Open the playground
          </a>
          <a className="cta-secondary" href="#/docs">
            Read the workflow
          </a>
        </div>
      </div>
      <aside className="panel hero-demo" aria-label="Sightglass demo summary">
        <span className="eyebrow">
          <span className="accent-dot" aria-hidden="true" />
          Opinionated demo
        </span>
        <div className="demo-stage">
          <div className="demo-toolbar">
            <span className="demo-chip">Select target</span>
            <span className="demo-chip">Scope: similar elements</span>
            <span className="demo-chip">Token radius: xl</span>
            <span className="demo-chip">Undo ready</span>
          </div>
          <div className="demo-audit">
            <strong>Critique output</strong>
            Motion warning: `transition: all` on a repeated card group. Route-level
            hierarchy drifts, and the CTA cluster needs clearer emphasis.
          </div>
          <div className="demo-audit">
            <strong>Explore direction</strong>
            “More restrained” keeps the card system but tightens hierarchy, uses the
            token surface stack, and lowers motion cost on list hover states.
          </div>
          <div className="demo-export">
            <strong>Machine-readable source of truth</strong>
            <pre>{`{
  "transactions": 4,
  "scope": "similar",
  "reviewArtifact": "local-session",
  "outputs": ["manifest", "agent-prompt"]
}`}</pre>
          </div>
        </div>
      </aside>
    </section>

    <section className="panel site-section">
      <span className="eyebrow">
        <span className="accent-dot" aria-hidden="true" />
        What ships with v1
      </span>
      <div className="pill-list" style={{ marginTop: 18 }}>
        {capabilityHighlights.map((highlight) => (
          <div className="pill" key={highlight}>
            {highlight}
          </div>
        ))}
      </div>
    </section>

    <section className="panel site-section">
      <span className="eyebrow">
        <span className="accent-dot" aria-hidden="true" />
        Product thesis
      </span>
      <h2 className="route-heading">Critique, exploration, and motion belong beside the editor.</h2>
      <p className="route-intro">
        The point of the product is not to generate another mock. It is to close
        the loop between inspection, critique, explicit edits, and review artifacts
        while the real app is still running.
      </p>
      <div className="section-grid two-up" style={{ marginTop: 18 }}>
        {featureCards.map((card) => (
          <article className="feature-card" key={card.title}>
            <h3>{card.title}</h3>
            <p>{card.body}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="panel site-section">
      <span className="eyebrow">
        <span className="accent-dot" aria-hidden="true" />
        Workflow
      </span>
      <div className="workflow-list" style={{ marginTop: 18 }}>
        {workflowSteps.map((step) => (
          <article className="workflow-step" key={step.title}>
            <h3>{step.title}</h3>
            <p>{step.body}</p>
          </article>
        ))}
      </div>
    </section>

    <section className="panel site-section">
      <span className="eyebrow">
        <span className="accent-dot" aria-hidden="true" />
        Package surface
      </span>
      <div className="section-grid two-up" style={{ marginTop: 18 }}>
        {packageCards.map((pkg) => (
          <article className="package-card" key={pkg.name}>
            <h3>{pkg.name}</h3>
            <p>{pkg.body}</p>
          </article>
        ))}
      </div>
    </section>
  </div>
);
