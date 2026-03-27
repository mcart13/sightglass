export const CardsFixture = () => (
  <section className="surface-panel" aria-label="Editorial cards">
    <div style={{ display: "grid", gap: 10 }}>
      <span className="section-kicker">Repeated cards</span>
      <h2 style={{ margin: 0, fontSize: 28 }}>
        A dense card rhythm gives critique and scope detection something real to chew on.
      </h2>
    </div>

    <div className="fixture-grid">
      {[
        {
          id: "fixture-card-primary",
          eyebrow: "Primary launch",
          title: "Ship the live-edit surface without sending the user to a side canvas.",
          body: "This card is intentionally close in weight to the rest of the set so the visual hierarchy still needs critique.",
          action: "Focus this theme",
        },
        {
          id: "fixture-card-secondary",
          eyebrow: "Review session",
          title: "Keep critique, explore mode, and motion tuning adjacent to the selected component.",
          body: "Repeated card chrome, matching buttons, and similar spacing create safe targets for component-wide edits.",
          action: "Compare directions",
        },
        {
          id: "fixture-card-tertiary",
          eyebrow: "Token ladder",
          title: "Expose utility-like classes and token-backed surfaces in the same grid.",
          body: "The selector model should be able to widen changes through repeated values and token-like semantics.",
          action: "Promote a token",
        },
      ].map((card, index) => (
        <article
          key={card.id}
          data-testid={card.id}
          data-sightglass-selectable="true"
          className="card card-product rounded-xl bg-surface-1 shadow-soft px-6 py-5 gap-4"
          style={{
            transform: `translateY(${index === 1 ? 8 : 0}px)`,
          }}
        >
          <span className="eyebrow-chip">{card.eyebrow}</span>
          <strong style={{ fontSize: 22, lineHeight: 1.2 }}>{card.title}</strong>
          <span className="text-ink-muted" style={{ lineHeight: 1.55 }}>
            {card.body}
          </span>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <button
              type="button"
              className="card-action rounded-pill bg-ink text-surface-0 px-4 py-3"
            >
              {card.action}
            </button>
            <button
              type="button"
              className="card-action secondary rounded-pill px-4 py-3"
            >
              Leave as-is
            </button>
          </div>
        </article>
      ))}
    </div>
  </section>
);
