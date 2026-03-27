export const FormsFixture = () => (
  <section className="surface-panel" aria-label="Forms and actions">
    <div style={{ display: "grid", gap: 10 }}>
      <span className="section-kicker">Forms and controls</span>
      <h2 style={{ margin: 0, fontSize: 28 }}>
        Forms, peer buttons, and action parity surface the critique model’s hierarchy checks.
      </h2>
    </div>

    <form
      onSubmit={(event) => event.preventDefault()}
      data-testid="fixture-form"
      data-sightglass-selectable="true"
      className="card rounded-xl bg-surface-0 shadow-tight px-6 py-5 gap-6"
    >
      <div className="field-row">
        <label className="field-stack">
          <span>Name</span>
          <input name="name" placeholder="Alex Morgan" defaultValue="Alex Morgan" />
        </label>
        <label className="field-stack">
          <span>Intent</span>
          <select name="intent" defaultValue="review">
            <option value="review">Review a landing surface</option>
            <option value="explore">Explore directions</option>
            <option value="motion">Tune motion</option>
          </select>
        </label>
      </div>

      <label className="field-stack">
        <span>What changed?</span>
        <textarea
          name="changes"
          rows={4}
          defaultValue="The launch surface gained live critique, motion notes, and session export. Now we need the hierarchy to feel sharper on mobile."
        />
      </label>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
        {["Save draft", "Run critique", "Send for review"].map((label) => (
          <button
            key={label}
            type="button"
            data-sightglass-selectable="true"
            className="card-action rounded-pill bg-ink text-surface-0 px-4 py-3"
          >
            {label}
          </button>
        ))}
      </div>
    </form>
  </section>
);
