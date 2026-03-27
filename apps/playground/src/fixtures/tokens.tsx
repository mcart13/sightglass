import type { CSSProperties } from "react";

const sectionStyle: CSSProperties = {
  display: "grid",
  gap: 20,
};

const rowStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
  gap: 16,
};

export const playgroundStyles = `
:root {
  --sg-bg: #efe4d2;
  --sg-bg-panel: rgba(255, 250, 242, 0.84);
  --sg-surface-0: #fffaf2;
  --sg-surface-1: #f6ecde;
  --sg-surface-2: #eadbc7;
  --sg-surface-accent: #d26a42;
  --sg-surface-accent-soft: rgba(210, 106, 66, 0.14);
  --sg-ink-strong: #24180f;
  --sg-ink-muted: #695847;
  --sg-border-soft: rgba(54, 36, 20, 0.12);
  --sg-shadow-soft: 0 28px 60px rgba(49, 30, 13, 0.12);
  --sg-shadow-tight: 0 16px 32px rgba(49, 30, 13, 0.1);
  --sg-radius-xl: 30px;
  --sg-radius-lg: 24px;
  --sg-radius-pill: 999px;
  --sg-gap-4: 16px;
  --sg-gap-6: 24px;
  --sg-gap-8: 32px;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  background:
    radial-gradient(circle at top left, rgba(255, 255, 255, 0.72), transparent 28rem),
    linear-gradient(180deg, #f5ead8 0%, #eaddc8 52%, #efe5d7 100%);
  color: var(--sg-ink-strong);
  font-family: "Avenir Next", "Segoe UI", sans-serif;
}

button,
input,
select,
textarea {
  font: inherit;
}

a {
  color: inherit;
  text-decoration: none;
}

#root {
  min-height: 100vh;
}

.playground-shell {
  display: grid;
  gap: 32px;
  padding: 32px 360px 160px 320px;
}

.hero-shell {
  display: grid;
  gap: 20px;
  padding: 40px;
  border-radius: 40px;
  background:
    linear-gradient(140deg, rgba(255, 248, 241, 0.94), rgba(243, 229, 211, 0.84)),
    rgba(255, 255, 255, 0.7);
  border: 1px solid rgba(54, 36, 20, 0.08);
  box-shadow: var(--sg-shadow-soft);
}

.hero-columns,
.fixture-columns {
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(260px, 0.8fr);
  gap: 20px;
}

.surface-panel {
  display: grid;
  gap: 18px;
  padding: 24px;
  border-radius: var(--sg-radius-xl);
  background: var(--sg-bg-panel);
  border: 1px solid var(--sg-border-soft);
  box-shadow: var(--sg-shadow-tight);
  backdrop-filter: blur(18px);
}

.fixture-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 16px;
}

.card {
  display: grid;
  gap: 12px;
  border: 1px solid var(--sg-border-soft);
}

.rounded-xl {
  border-radius: var(--sg-radius-xl);
}

.rounded-lg {
  border-radius: var(--sg-radius-lg);
}

.rounded-pill {
  border-radius: var(--sg-radius-pill);
}

.bg-surface-0 {
  background: var(--sg-surface-0);
}

.bg-surface-1 {
  background: var(--sg-surface-1);
}

.bg-surface-2 {
  background: var(--sg-surface-2);
}

.bg-accent-soft {
  background: var(--sg-surface-accent-soft);
}

.bg-ink {
  background: var(--sg-ink-strong);
}

.text-ink-strong {
  color: var(--sg-ink-strong);
}

.text-ink-muted {
  color: var(--sg-ink-muted);
}

.text-surface-0 {
  color: var(--sg-surface-0);
}

.shadow-soft {
  box-shadow: var(--sg-shadow-soft);
}

.shadow-tight {
  box-shadow: var(--sg-shadow-tight);
}

.px-4 {
  padding-inline: 16px;
}

.px-6 {
  padding-inline: 24px;
}

.py-3 {
  padding-block: 12px;
}

.py-5 {
  padding-block: 20px;
}

.gap-4 {
  gap: var(--sg-gap-4);
}

.gap-6 {
  gap: var(--sg-gap-6);
}

.gap-8 {
  gap: var(--sg-gap-8);
}

.section-kicker {
  margin: 0;
  color: var(--sg-ink-muted);
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.section-title {
  margin: 0;
  font-family: "Iowan Old Style", "Palatino Linotype", serif;
  font-size: clamp(2.2rem, 3vw, 3.4rem);
  line-height: 1;
}

.eyebrow-chip,
.token-chip {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  width: fit-content;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(54, 36, 20, 0.1);
  color: var(--sg-ink-muted);
  font-size: 13px;
}

.card-action {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: 0;
  cursor: pointer;
}

.card-action.secondary {
  background: rgba(255, 255, 255, 0.68);
  color: var(--sg-ink-strong);
  border: 1px solid rgba(54, 36, 20, 0.12);
}

.metric-strip {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.metric-card {
  display: grid;
  gap: 8px;
  padding: 16px;
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.62);
  border: 1px solid rgba(54, 36, 20, 0.1);
}

.field-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;
}

.field-stack {
  display: grid;
  gap: 8px;
}

.field-stack input,
.field-stack textarea,
.field-stack select {
  width: 100%;
  padding: 12px 14px;
  border-radius: 18px;
  border: 1px solid rgba(54, 36, 20, 0.16);
  background: rgba(255, 255, 255, 0.88);
  color: var(--sg-ink-strong);
}

.mobile-pressure {
  display: grid;
  grid-template-columns: minmax(0, 1.5fr) minmax(220px, 0.8fr);
  gap: 12px;
}

.scroll-ribbon {
  display: flex;
  gap: 12px;
  overflow-x: auto;
  padding-bottom: 4px;
}

.scroll-ribbon::-webkit-scrollbar {
  height: 10px;
}

.scroll-ribbon::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgba(54, 36, 20, 0.18);
}

.empty-state {
  min-height: 220px;
  place-items: center;
  text-align: center;
}

.long-copy {
  display: grid;
  gap: 14px;
  line-height: 1.65;
  color: var(--sg-ink-muted);
}

@media (max-width: 1200px) {
  .playground-shell {
    padding: 128px 24px 160px 24px;
  }
}

@media (max-width: 820px) {
  .hero-columns,
  .fixture-columns,
  .mobile-pressure,
  .metric-strip {
    grid-template-columns: 1fr;
  }

  .playground-shell {
    gap: 24px;
  }
}
`;

export const TokensFixture = () => (
  <section className="surface-panel" aria-label="Token-backed styles">
    <div style={sectionStyle}>
      <span className="section-kicker">Design tokens</span>
      <h2 style={{ margin: 0, fontSize: 28 }}>
        Token-backed styles stay visible in the fixture surface
      </h2>
      <p style={{ margin: 0, color: "var(--sg-ink-muted)", lineHeight: 1.6 }}>
        The palette, radius, spacing, and shadow treatments are all bound to named
        variables so semantic edits can promote beyond a single instance.
      </p>
    </div>

    <div style={rowStyle}>
      <article
        data-sightglass-selectable="true"
        data-testid="fixture-token-card"
        className="card rounded-xl bg-surface-0 shadow-tight px-6 py-5 gap-4"
        style={{
          borderLeft: "8px solid var(--sg-surface-accent)",
        }}
      >
        <span className="token-chip">Accent surface · var(--sg-surface-accent)</span>
        <strong style={{ fontSize: 20 }}>
          Design system aware editing starts with the surface itself.
        </strong>
        <span style={{ color: "var(--sg-ink-muted)" }}>
          Select this card to inspect radius, spacing, and repeated background treatments.
        </span>
      </article>

      <div className="metric-strip">
        {[
          { label: "Radius", value: "30px" },
          { label: "Gap", value: "24px" },
          { label: "Shadow", value: "Soft" },
        ].map((metric) => (
          <div
            key={metric.label}
            data-sightglass-selectable="true"
            className="metric-card rounded-lg"
          >
            <span className="section-kicker">{metric.label}</span>
            <strong style={{ fontSize: 26 }}>{metric.value}</strong>
          </div>
        ))}
      </div>
    </div>
  </section>
);
