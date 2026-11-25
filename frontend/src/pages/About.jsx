const POINTS = [
  { title: "One place for admissions", text: "Admit, update and discharge patients without switching tools." },
  { title: "Find anyone fast", text: "Search by name and narrow by ward, department, doctor or status." },
  { title: "Checked on both sides", text: "Every entry is validated in the browser and again on the server." },
];

export default function About() {
  return (
    <section className="page">
      <div className="panel">
        <h1>About this system</h1>
        <p className="lead">
          CityCare's admission desk uses this dashboard to keep a live record of who is in the hospital,
          where they are, and which doctor is responsible.
        </p>
        <p className="muted">Built with React and Vite on the front end, and FastAPI with SQLAlchemy on the back end.</p>
      </div>
      <div className="grid-3">
        {POINTS.map((p) => (
          <div className="panel hover-lift" key={p.title}>
            <h3>{p.title}</h3>
            <p className="muted">{p.text}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
