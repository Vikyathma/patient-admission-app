// Sticky top navigation: Dashboard, About, Contact Us.
const LINKS = [
  { id: "dashboard", label: "Dashboard" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact Us" },
];

export default function Navbar({ view, onChange }) {
  return (
    <header className="navbar">
      <div className="navbar-inner">
        <button className="brand" onClick={() => onChange("dashboard")} aria-label="Go to dashboard">
          <span className="glass-badge" aria-hidden="true">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round">
              <path d="M12 5v14M5 12h14" />
            </svg>
          </span>
          <span>CityCare Hospital</span>
        </button>
        <nav className="nav-links" aria-label="Main">
          {LINKS.map((l) => (
            <button key={l.id} className={`nav-link ${view === l.id ? "active" : ""}`} onClick={() => onChange(l.id)}>
              {l.label}
            </button>
          ))}
        </nav>
      </div>
    </header>
  );
}
