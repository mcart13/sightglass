import type { CSSProperties } from "react";

const heroStyle: CSSProperties = {
  display: "grid",
  gap: 24,
  textAlign: "center",
  padding: "60px 40px 48px",
  borderRadius: "var(--sg-radius-xl)",
  background:
    "linear-gradient(160deg, rgba(255, 252, 247, 0.96), rgba(237, 221, 197, 0.88))",
  border: "1px solid var(--sg-border-soft)",
  boxShadow: "var(--sg-shadow-soft)",
};

const navStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 24px",
  borderRadius: "var(--sg-radius-pill)",
  background: "rgba(255, 255, 255, 0.82)",
  border: "1px solid var(--sg-border-soft)",
  backdropFilter: "blur(12px)",
};

const navLinkStyle: CSSProperties = {
  padding: "6px 14px",
  borderRadius: "var(--sg-radius-pill)",
  color: "var(--sg-ink-muted)",
  fontSize: 14,
  cursor: "pointer",
  border: "none",
  background: "transparent",
};

const ctaPrimaryStyle: CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: 8,
  padding: "14px 28px",
  borderRadius: "var(--sg-radius-pill)",
  background: "var(--sg-ink-strong)",
  color: "var(--sg-surface-0)",
  border: "none",
  fontSize: 16,
  fontWeight: 600,
  cursor: "pointer",
  transition: "transform 0.2s ease, box-shadow 0.2s ease",
};

const ctaSecondaryStyle: CSSProperties = {
  ...ctaPrimaryStyle,
  background: "rgba(255, 255, 255, 0.88)",
  color: "var(--sg-ink-strong)",
  border: "1px solid var(--sg-border-soft)",
};

const featureCardStyle: CSSProperties = {
  display: "grid",
  gap: 14,
  padding: 24,
  borderRadius: "var(--sg-radius-lg)",
  background: "var(--sg-bg-panel)",
  border: "1px solid var(--sg-border-soft)",
  boxShadow: "var(--sg-shadow-tight)",
};

const pricingCardStyle: CSSProperties = {
  display: "grid",
  gap: 16,
  padding: 28,
  borderRadius: "var(--sg-radius-xl)",
  background: "var(--sg-bg-panel)",
  border: "1px solid var(--sg-border-soft)",
  boxShadow: "var(--sg-shadow-tight)",
};

const pricingFeaturedStyle: CSSProperties = {
  ...pricingCardStyle,
  background:
    "linear-gradient(160deg, var(--sg-surface-0), rgba(237, 221, 197, 0.6))",
  border: "2px solid var(--sg-surface-accent)",
  boxShadow: "var(--sg-shadow-soft)",
};

const testimonialStyle: CSSProperties = {
  display: "grid",
  gap: 14,
  padding: 24,
  borderRadius: "var(--sg-radius-lg)",
  background: "rgba(255, 255, 255, 0.72)",
  border: "1px solid var(--sg-border-soft)",
};

const badgeStyle: CSSProperties = {
  display: "inline-flex",
  width: "fit-content",
  padding: "4px 10px",
  borderRadius: "var(--sg-radius-pill)",
  background: "var(--sg-surface-accent-soft)",
  color: "var(--sg-surface-accent)",
  fontSize: 12,
  fontWeight: 600,
  letterSpacing: "0.06em",
  textTransform: "uppercase",
};

const checkStyle: CSSProperties = {
  color: "var(--sg-surface-accent)",
  fontSize: 14,
};

const footerStyle: CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1.5fr 1fr 1fr 1fr",
  gap: 32,
  padding: "40px 32px",
  borderRadius: "var(--sg-radius-xl)",
  background: "var(--sg-ink-strong)",
  color: "var(--sg-surface-1)",
};

const footerLinkStyle: CSSProperties = {
  color: "var(--sg-surface-2)",
  fontSize: 14,
  lineHeight: 2,
};

const FEATURES = [
  {
    icon: "🔍",
    title: "Live Inspection",
    description:
      "Click any element on the page. Sightglass resolves its role, token bindings, and scope candidates instantly.",
  },
  {
    icon: "🎨",
    title: "Design-System Scope",
    description:
      "Edits are token-aware. Change one component and its siblings follow, respecting the semantic layer.",
  },
  {
    icon: "📝",
    title: "Structured Critique",
    description:
      "Five built-in lenses score visual design, accessibility, interface consistency, and motion quality.",
  },
  {
    icon: "🧭",
    title: "Explore Directions",
    description:
      "After critique, explore generated design directions that bundle findings into coherent edit plans.",
  },
  {
    icon: "🎬",
    title: "Motion Lab",
    description:
      "Storyboard each motion phase, tune duration and easing with live sliders, and audit for reduced-motion safety.",
  },
  {
    icon: "💾",
    title: "Session Review",
    description:
      "Every edit, critique, and exploration is bundled into a portable session artifact you can save and share.",
  },
] as const;

const PRICING = [
  {
    tier: "Starter",
    price: "$0",
    period: "/forever",
    description: "For solo designers exploring their own projects.",
    features: [
      "Live element inspection",
      "Single-element scope edits",
      "Visual & accessibility critique",
      "Local session storage",
    ],
    featured: false,
  },
  {
    tier: "Pro",
    price: "$29",
    period: "/month",
    description: "For design engineers shipping production interfaces.",
    features: [
      "Everything in Starter",
      "Component & token scope",
      "Explore mode with edit plans",
      "Motion lab & storyboards",
      "Export change manifests",
      "Team session sharing",
    ],
    featured: true,
  },
  {
    tier: "Enterprise",
    price: "Custom",
    period: "",
    description: "For organizations with design system governance needs.",
    features: [
      "Everything in Pro",
      "SSO & RBAC",
      "Design system policy enforcement",
      "Audit trail & compliance export",
      "Dedicated onboarding",
      "SLA & priority support",
    ],
    featured: false,
  },
] as const;

const TESTIMONIALS = [
  {
    quote:
      "We used to screenshot Figma diffs and paste them in Slack. Now critique runs on the live build and the edit plan lands in the PR.",
    name: "Ava Chen",
    role: "Staff Design Engineer, Lattice",
  },
  {
    quote:
      "Motion lab caught a layout-thrashing transition-all on our pricing toggle. Fixing it dropped Interaction to Next Paint by 40ms.",
    name: "Marcus Rivera",
    role: "Frontend Lead, Campsite",
  },
  {
    quote:
      "The explore directions feature turned a vague 'this card feels off' into three concrete edit plans our junior engineers could ship.",
    name: "Priya Sharma",
    role: "Design Systems Manager, Watershed",
  },
] as const;

export const LandingPageFixture = () => (
  <section style={{ display: "grid", gap: 32 }}>
    <span className="section-kicker">Landing page test surface</span>

    {/* Nav */}
    <nav style={navStyle} data-sightglass-selectable="true">
      <strong style={{ fontSize: 18, color: "var(--sg-ink-strong)" }}>
        Sightglass
      </strong>
      <div style={{ display: "flex", gap: 4 }}>
        <button type="button" style={navLinkStyle}>
          Features
        </button>
        <button type="button" style={navLinkStyle}>
          Pricing
        </button>
        <button type="button" style={navLinkStyle}>
          Docs
        </button>
        <button type="button" style={navLinkStyle}>
          Changelog
        </button>
      </div>
      <button
        type="button"
        style={{ ...ctaPrimaryStyle, padding: "10px 20px", fontSize: 14 }}
      >
        Get started
      </button>
    </nav>

    {/* Hero */}
    <div style={heroStyle} data-sightglass-selectable="true">
      <span style={badgeStyle}>Now in public beta</span>
      <h1
        style={{
          margin: 0,
          fontFamily: "'Iowan Old Style', 'Palatino Linotype', serif",
          fontSize: "clamp(2.4rem, 4vw, 3.6rem)",
          lineHeight: 1.05,
          color: "var(--sg-ink-strong)",
        }}
      >
        Design review that lives
        <br />
        on the real interface
      </h1>
      <p
        style={{
          margin: "0 auto",
          maxWidth: 560,
          color: "var(--sg-ink-muted)",
          fontSize: 18,
          lineHeight: 1.7,
        }}
      >
        Stop screenshotting Figma. Sightglass lets you inspect, critique, and
        edit live UI with design-system awareness built in.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button type="button" style={ctaPrimaryStyle}>
          Start free trial
        </button>
        <button type="button" style={ctaSecondaryStyle}>
          Watch demo
        </button>
      </div>
    </div>

    {/* Social proof strip */}
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: 32,
        padding: "16px 0",
        color: "var(--sg-ink-muted)",
        fontSize: 13,
        letterSpacing: "0.04em",
      }}
      data-sightglass-selectable="true"
    >
      <span>Trusted by teams at</span>
      <strong style={{ opacity: 0.5 }}>Vercel</strong>
      <strong style={{ opacity: 0.5 }}>Linear</strong>
      <strong style={{ opacity: 0.5 }}>Stripe</strong>
      <strong style={{ opacity: 0.5 }}>Figma</strong>
      <strong style={{ opacity: 0.5 }}>Notion</strong>
    </div>

    {/* Features */}
    <section style={{ display: "grid", gap: 20 }}>
      <div style={{ textAlign: "center", display: "grid", gap: 8 }}>
        <span className="section-kicker">Capabilities</span>
        <h2
          style={{
            margin: 0,
            fontFamily: "'Iowan Old Style', 'Palatino Linotype', serif",
            fontSize: "clamp(1.6rem, 2.5vw, 2.4rem)",
            lineHeight: 1.1,
          }}
        >
          Everything you need to review live UI
        </h2>
      </div>
      <div className="fixture-grid">
        {FEATURES.map((feature) => (
          <div
            key={feature.title}
            style={featureCardStyle}
            data-sightglass-selectable="true"
          >
            <span style={{ fontSize: 28 }}>{feature.icon}</span>
            <strong style={{ fontSize: 17 }}>{feature.title}</strong>
            <span
              style={{
                color: "var(--sg-ink-muted)",
                lineHeight: 1.6,
                fontSize: 14,
              }}
            >
              {feature.description}
            </span>
          </div>
        ))}
      </div>
    </section>

    {/* Pricing */}
    <section style={{ display: "grid", gap: 20 }}>
      <div style={{ textAlign: "center", display: "grid", gap: 8 }}>
        <span className="section-kicker">Pricing</span>
        <h2
          style={{
            margin: 0,
            fontFamily: "'Iowan Old Style', 'Palatino Linotype', serif",
            fontSize: "clamp(1.6rem, 2.5vw, 2.4rem)",
            lineHeight: 1.1,
          }}
        >
          Simple, transparent pricing
        </h2>
      </div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 16,
          alignItems: "start",
        }}
      >
        {PRICING.map((plan) => (
          <div
            key={plan.tier}
            style={plan.featured ? pricingFeaturedStyle : pricingCardStyle}
            data-sightglass-selectable="true"
          >
            {plan.featured && <span style={badgeStyle}>Most popular</span>}
            <strong style={{ fontSize: 20 }}>{plan.tier}</strong>
            <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
              <span
                style={{
                  fontFamily: "'Iowan Old Style', 'Palatino Linotype', serif",
                  fontSize: 42,
                  fontWeight: 700,
                  lineHeight: 1,
                }}
              >
                {plan.price}
              </span>
              {plan.period && (
                <span style={{ color: "var(--sg-ink-muted)", fontSize: 14 }}>
                  {plan.period}
                </span>
              )}
            </div>
            <span
              style={{
                color: "var(--sg-ink-muted)",
                fontSize: 14,
                lineHeight: 1.5,
              }}
            >
              {plan.description}
            </span>
            <hr
              style={{
                border: "none",
                borderTop: "1px solid var(--sg-border-soft)",
                margin: 0,
              }}
            />
            <ul
              style={{
                margin: 0,
                padding: 0,
                listStyle: "none",
                display: "grid",
                gap: 10,
              }}
            >
              {plan.features.map((feature) => (
                <li
                  key={feature}
                  style={{ display: "flex", gap: 8, fontSize: 14 }}
                >
                  <span style={checkStyle}>✓</span>
                  <span>{feature}</span>
                </li>
              ))}
            </ul>
            <button
              type="button"
              style={plan.featured ? ctaPrimaryStyle : ctaSecondaryStyle}
            >
              {plan.tier === "Enterprise" ? "Contact sales" : "Get started"}
            </button>
          </div>
        ))}
      </div>
    </section>

    {/* Testimonials */}
    <section style={{ display: "grid", gap: 20 }}>
      <div style={{ textAlign: "center", display: "grid", gap: 8 }}>
        <span className="section-kicker">What teams are saying</span>
        <h2
          style={{
            margin: 0,
            fontFamily: "'Iowan Old Style', 'Palatino Linotype', serif",
            fontSize: "clamp(1.6rem, 2.5vw, 2.4rem)",
            lineHeight: 1.1,
          }}
        >
          Built for the way teams actually ship
        </h2>
      </div>
      <div className="fixture-grid">
        {TESTIMONIALS.map((testimonial) => (
          <div
            key={testimonial.name}
            style={testimonialStyle}
            data-sightglass-selectable="true"
          >
            <p
              style={{
                margin: 0,
                color: "var(--sg-ink-strong)",
                lineHeight: 1.65,
                fontSize: 15,
              }}
            >
              "{testimonial.quote}"
            </p>
            <div style={{ display: "grid", gap: 2 }}>
              <strong style={{ fontSize: 14 }}>{testimonial.name}</strong>
              <span style={{ color: "var(--sg-ink-muted)", fontSize: 13 }}>
                {testimonial.role}
              </span>
            </div>
          </div>
        ))}
      </div>
    </section>

    {/* Final CTA */}
    <div
      style={{
        display: "grid",
        gap: 20,
        textAlign: "center",
        padding: "48px 40px",
        borderRadius: "var(--sg-radius-xl)",
        background: "linear-gradient(160deg, var(--sg-ink-strong), #3a2618)",
        color: "var(--sg-surface-0)",
      }}
      data-sightglass-selectable="true"
    >
      <h2
        style={{
          margin: 0,
          fontFamily: "'Iowan Old Style', 'Palatino Linotype', serif",
          fontSize: "clamp(1.8rem, 3vw, 2.8rem)",
          lineHeight: 1.1,
        }}
      >
        Ready to stop reviewing screenshots?
      </h2>
      <p
        style={{
          margin: "0 auto",
          maxWidth: 480,
          opacity: 0.7,
          lineHeight: 1.7,
        }}
      >
        Start your free trial today. No credit card required.
      </p>
      <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
        <button
          type="button"
          style={{
            ...ctaPrimaryStyle,
            background: "var(--sg-surface-0)",
            color: "var(--sg-ink-strong)",
          }}
        >
          Start free trial
        </button>
        <button
          type="button"
          style={{
            ...ctaSecondaryStyle,
            background: "transparent",
            color: "var(--sg-surface-0)",
            borderColor: "rgba(255, 255, 255, 0.2)",
          }}
        >
          Schedule a demo
        </button>
      </div>
    </div>

    {/* Footer */}
    <footer style={footerStyle} data-sightglass-selectable="true">
      <div style={{ display: "grid", gap: 12, alignContent: "start" }}>
        <strong style={{ fontSize: 18, color: "var(--sg-surface-0)" }}>
          Sightglass
        </strong>
        <span style={{ fontSize: 14, opacity: 0.6, lineHeight: 1.6 }}>
          Live design review for teams that ship real interfaces.
        </span>
      </div>
      <div style={{ display: "grid", gap: 4, alignContent: "start" }}>
        <strong
          style={{
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.5,
          }}
        >
          Product
        </strong>
        <a href="#" style={footerLinkStyle}>
          Features
        </a>
        <a href="#" style={footerLinkStyle}>
          Pricing
        </a>
        <a href="#" style={footerLinkStyle}>
          Changelog
        </a>
        <a href="#" style={footerLinkStyle}>
          Roadmap
        </a>
      </div>
      <div style={{ display: "grid", gap: 4, alignContent: "start" }}>
        <strong
          style={{
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.5,
          }}
        >
          Resources
        </strong>
        <a href="#" style={footerLinkStyle}>
          Documentation
        </a>
        <a href="#" style={footerLinkStyle}>
          API Reference
        </a>
        <a href="#" style={footerLinkStyle}>
          Blog
        </a>
        <a href="#" style={footerLinkStyle}>
          Community
        </a>
      </div>
      <div style={{ display: "grid", gap: 4, alignContent: "start" }}>
        <strong
          style={{
            fontSize: 13,
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            opacity: 0.5,
          }}
        >
          Company
        </strong>
        <a href="#" style={footerLinkStyle}>
          About
        </a>
        <a href="#" style={footerLinkStyle}>
          Careers
        </a>
        <a href="#" style={footerLinkStyle}>
          Privacy
        </a>
        <a href="#" style={footerLinkStyle}>
          Terms
        </a>
      </div>
    </footer>
  </section>
);
