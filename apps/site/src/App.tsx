import { useEffect, useState } from "react";
import { playgroundUrl } from "./playground-url.js";
import { DocsRoute } from "./routes/docs.js";
import { HomeRoute } from "./routes/index.js";

type SiteRoute = "home" | "docs";

const resolveRoute = (hash: string): SiteRoute => {
  const normalized = hash.trim().replace(/\/+$/, "").toLowerCase();
  return normalized === "#/docs" ? "docs" : "home";
};

const appStyles = `
  :root {
    color-scheme: light;
    --sg-bg: #f5efe4;
    --sg-surface: rgba(255, 255, 255, 0.88);
    --sg-surface-strong: rgba(252, 246, 237, 0.96);
    --sg-border: rgba(63, 46, 31, 0.12);
    --sg-copy: #25180e;
    --sg-copy-muted: #665444;
    --sg-accent: #0f6a62;
    --sg-accent-soft: rgba(15, 106, 98, 0.14);
    --sg-shadow: 0 28px 60px rgba(37, 24, 14, 0.14);
    --sg-radius-xl: 28px;
    --sg-radius-lg: 20px;
    --sg-radius-md: 14px;
    font-family: "Instrument Sans", "Inter", system-ui, sans-serif;
    background:
      radial-gradient(circle at top left, rgba(15, 106, 98, 0.14), transparent 34%),
      linear-gradient(180deg, #fbf7f0 0%, var(--sg-bg) 100%);
    color: var(--sg-copy);
  }

  * { box-sizing: border-box; }
  body {
    margin: 0;
    min-width: 320px;
    background: transparent;
    color: var(--sg-copy);
  }

  a { color: inherit; }

  .site-shell {
    min-height: 100vh;
    padding: 32px 20px 56px;
  }

  .site-frame {
    max-width: 1180px;
    margin: 0 auto;
  }

  .site-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    padding: 18px 22px;
    border: 1px solid var(--sg-border);
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.74);
    box-shadow: 0 18px 34px rgba(37, 24, 14, 0.08);
    backdrop-filter: blur(20px);
  }

  .site-brand {
    display: flex;
    align-items: center;
    gap: 12px;
    text-decoration: none;
    font-weight: 700;
    letter-spacing: -0.03em;
  }

  .site-brand-mark {
    display: inline-flex;
    width: 36px;
    height: 36px;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    background: linear-gradient(135deg, #1d8b80, #0f6a62);
    color: white;
    box-shadow: 0 14px 24px rgba(15, 106, 98, 0.24);
  }

  .site-nav-links {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .site-nav-link {
    border: 1px solid transparent;
    border-radius: 999px;
    padding: 10px 14px;
    text-decoration: none;
    color: var(--sg-copy-muted);
    transition: background-color 160ms ease, color 160ms ease, border-color 160ms ease;
  }

  .site-nav-link[aria-current="page"] {
    border-color: rgba(15, 106, 98, 0.2);
    background: var(--sg-accent-soft);
    color: var(--sg-copy);
  }

  .site-content {
    padding-top: 28px;
  }

  .eyebrow {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.8);
    border: 1px solid rgba(15, 106, 98, 0.16);
    color: var(--sg-copy-muted);
    font-size: 0.9rem;
  }

  .accent-dot {
    width: 9px;
    height: 9px;
    border-radius: 999px;
    background: var(--sg-accent);
  }

  .panel {
    border: 1px solid var(--sg-border);
    border-radius: var(--sg-radius-xl);
    background: var(--sg-surface);
    box-shadow: var(--sg-shadow);
    backdrop-filter: blur(18px);
  }

  .section-grid {
    display: grid;
    gap: 18px;
  }

  .section-grid.two-up {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .pill-list,
  .feature-list,
  .workflow-list,
  .package-list {
    display: grid;
    gap: 12px;
  }

  .pill-list {
    grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  }

  .pill {
    border: 1px solid rgba(15, 106, 98, 0.18);
    border-radius: 999px;
    padding: 11px 14px;
    background: rgba(255, 255, 255, 0.9);
    color: var(--sg-copy-muted);
    text-align: center;
  }

  .feature-card,
  .package-card,
  .workflow-step,
  .note-card {
    padding: 22px;
    border-radius: var(--sg-radius-lg);
    border: 1px solid var(--sg-border);
    background: var(--sg-surface-strong);
  }

  .hero-grid {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(320px, 0.9fr);
    gap: 22px;
  }

  .hero-copy {
    padding: 28px;
  }

  .hero-copy h1,
  .route-heading {
    margin: 18px 0 12px;
    font-family: "Fraunces", "Georgia", serif;
    font-size: clamp(2.8rem, 6vw, 5rem);
    line-height: 0.95;
    letter-spacing: -0.05em;
  }

  .route-heading {
    font-size: clamp(2.2rem, 4vw, 3.4rem);
  }

  .hero-copy p,
  .route-intro,
  .feature-card p,
  .note-card p,
  .workflow-step p,
  .package-card p {
    margin: 0;
    color: var(--sg-copy-muted);
    line-height: 1.6;
  }

  .hero-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 12px;
    margin-top: 24px;
  }

  .cta-primary,
  .cta-secondary {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    border-radius: 999px;
    padding: 12px 18px;
    font-weight: 600;
    text-decoration: none;
    border: 1px solid transparent;
  }

  .cta-primary {
    background: var(--sg-accent);
    color: white;
    box-shadow: 0 18px 34px rgba(15, 106, 98, 0.24);
  }

  .cta-secondary {
    border-color: rgba(37, 24, 14, 0.12);
    background: rgba(255, 255, 255, 0.84);
    color: var(--sg-copy);
  }

  .hero-demo {
    padding: 24px;
    display: grid;
    gap: 16px;
  }

  .demo-stage {
    display: grid;
    gap: 12px;
  }

  .demo-toolbar,
  .demo-audit,
  .demo-export {
    border-radius: var(--sg-radius-md);
    padding: 16px;
    border: 1px solid rgba(15, 106, 98, 0.12);
    background: rgba(255, 255, 255, 0.86);
  }

  .demo-toolbar {
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
  }

  .demo-chip {
    padding: 10px 12px;
    border-radius: 999px;
    background: rgba(15, 106, 98, 0.1);
    color: var(--sg-copy);
    font-size: 0.92rem;
  }

  .demo-audit strong,
  .demo-export strong {
    display: block;
    margin-bottom: 8px;
    font-size: 0.95rem;
  }

  .demo-export pre,
  .docs-snippet {
    margin: 0;
    overflow-x: auto;
    border-radius: 16px;
    padding: 16px;
    background: #1f1a15;
    color: #f8efe1;
    font-size: 0.88rem;
    line-height: 1.55;
  }

  .site-section {
    margin-top: 22px;
    padding: 28px;
  }

  .site-footer {
    margin-top: 28px;
    padding: 18px 20px 0;
    color: var(--sg-copy-muted);
    font-size: 0.95rem;
    text-align: center;
  }

  @media (max-width: 900px) {
    .hero-grid,
    .section-grid.two-up {
      grid-template-columns: 1fr;
    }

    .site-nav {
      align-items: flex-start;
      border-radius: 24px;
    }
  }

  @media (max-width: 640px) {
    .site-shell {
      padding-inline: 14px;
    }

    .site-nav,
    .hero-copy,
    .hero-demo,
    .site-section {
      padding: 20px;
    }
  }
`;

export const App = (): React.JSX.Element => {
  const [route, setRoute] = useState<SiteRoute>(() =>
    resolveRoute(window.location.hash),
  );

  useEffect(() => {
    const handleHashChange = () => {
      setRoute(resolveRoute(window.location.hash));
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <>
      <style>{appStyles}</style>
      <div className="site-shell">
        <div className="site-frame">
          <header className="site-nav">
            <a className="site-brand" href="#/">
              <span className="site-brand-mark">S</span>
              <span>Sightglass</span>
            </a>
            <nav className="site-nav-links" aria-label="Sightglass navigation">
              <a
                className="site-nav-link"
                href="#/"
                aria-current={route === "home" ? "page" : undefined}
              >
                Product
              </a>
              <a
                className="site-nav-link"
                href="#/docs"
                aria-current={route === "docs" ? "page" : undefined}
              >
                Docs
              </a>
              <a className="site-nav-link" href={playgroundUrl}>
                Playground
              </a>
            </nav>
          </header>
          <main className="site-content">
            {route === "docs" ? <DocsRoute /> : <HomeRoute />}
          </main>
          <footer className="site-footer">
            Local-first by default. Machine-readable export stays the source of truth.
          </footer>
        </div>
      </div>
    </>
  );
};
