export const MotionFixture = () => (
  <section className="surface-panel" aria-label="Motion examples">
    <div style={{ display: "grid", gap: 10 }}>
      <span className="section-kicker">Motion lab fixtures</span>
      <h2 style={{ margin: 0, fontSize: 28 }}>
        Good and bad motion patterns sit side by side for critique and tuning.
      </h2>
    </div>

    <div className="fixture-grid">
      <article
        data-testid="fixture-motion-good"
        data-sightglass-selectable="true"
        className="card rounded-xl bg-surface-0 shadow-tight px-6 py-5 gap-4"
        style={{
          transition: "transform 180ms ease, opacity 180ms ease",
        }}
      >
        <span className="eyebrow-chip">Compositor-safe</span>
        <strong style={{ fontSize: 22 }}>Short transform and opacity transitions</strong>
        <span className="text-ink-muted">
          This example keeps motion tight and leaves room for reduced-motion tuning.
        </span>
      </article>

      <article
        data-testid="fixture-motion-bad"
        data-sightglass-selectable="true"
        className="card rounded-xl bg-surface-2 shadow-tight px-6 py-5 gap-4"
        style={{
          transition: "all 480ms ease",
          width: "100%",
        }}
      >
        <span className="eyebrow-chip">Layout-risk</span>
        <strong style={{ fontSize: 22 }}>
          A broad transition list slows a common interaction down
        </strong>
        <span className="text-ink-muted">
          Selecting this block should surface the `transition: all` warning and a heavier-than-needed duration.
        </span>
      </article>
    </div>
  </section>
);
