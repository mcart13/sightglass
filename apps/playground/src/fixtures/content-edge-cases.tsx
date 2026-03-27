export const ContentEdgeCasesFixture = () => (
  <section className="surface-panel" aria-label="Content edge cases">
    <div style={{ display: "grid", gap: 10 }}>
      <span className="section-kicker">Edge cases</span>
      <h2 style={{ margin: 0, fontSize: 28 }}>
        Long copy, empty states, and mobile-pressure layouts keep the playground honest.
      </h2>
    </div>

    <div className="mobile-pressure">
      <article
        data-testid="fixture-long-copy"
        data-sightglass-selectable="true"
        className="card rounded-xl bg-surface-0 shadow-tight px-6 py-5 gap-4 long-copy"
      >
        <strong style={{ fontSize: 22 }}>
          Long-form review context should still scan well when critique is open.
        </strong>
        <p style={{ margin: 0 }}>
          Sightglass lives beside the product, so the working page still needs to hold long paragraphs,
          status notes, and dense review artifacts without collapsing into an unreadable wall. The copy
          here is intentionally longer than the surrounding modules so the fixture can pressure spacing,
          line length, and the balance between editorial hierarchy and utilitarian review detail.
        </p>
        <p style={{ margin: 0 }}>
          The mobile-pressure column on the right compresses quickly, which makes it useful for checking
          how much card chrome and badge repetition a release surface can survive before it starts feeling
          ornamental instead of clear.
        </p>
      </article>

      <aside
        data-testid="fixture-empty-state"
        data-sightglass-selectable="true"
        className="card rounded-xl bg-surface-1 shadow-tight px-6 py-5 gap-4 empty-state"
      >
        <div style={{ display: "grid", gap: 10, justifyItems: "center" }}>
          <strong style={{ fontSize: 20 }}>No review sessions yet</strong>
          <span className="text-ink-muted">
            Save the current critique and restore it later without leaving the surface.
          </span>
          <button
            type="button"
            className="card-action secondary rounded-pill px-4 py-3"
          >
            Seed demo data
          </button>
        </div>
      </aside>
    </div>

    <div className="scroll-ribbon">
      {["Phone", "Tablet", "Laptop", "Wall display"].map((viewport) => (
        <div
          key={viewport}
          data-sightglass-selectable="true"
          className="metric-card rounded-lg"
          style={{ minWidth: 180 }}
        >
          <span className="section-kicker">{viewport}</span>
          <strong style={{ fontSize: 22 }}>Pressure-test this layout</strong>
        </div>
      ))}
    </div>
  </section>
);
