import { useState } from "react";

// Directory cards (static hospital contact info).
const DIRECTORY = [
  { name: "Emergency", ext: "Ext. 100", note: "Open 24 hours", urgent: true },
  { name: "ICU", ext: "Ext. 210", note: "Visitors 4 PM to 6 PM" },
  { name: "Maternity", ext: "Ext. 320", note: "Open 24 hours" },
  { name: "Pediatrics", ext: "Ext. 330", note: "8 AM to 8 PM" },
  { name: "Surgical", ext: "Ext. 410", note: "8 AM to 6 PM" },
  { name: "General Ward", ext: "Ext. 150", note: "8 AM to 8 PM" },
];

const EMPTY = { name: "", email: "", topic: "", message: "" };
const TOPICS = ["Admission query", "Report a data issue", "Technical support", "Other"];

function validate(f) {
  const e = {};
  if (!f.name.trim()) e.name = "Name is required";
  if (!f.email.trim()) e.email = "Email is required";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.email)) e.email = "Enter a valid email address";
  if (!f.topic) e.topic = "Choose a topic";
  if (f.message.trim().length < 10) e.message = "Message must be at least 10 characters";
  return e;
}

export default function Contact({ onSent }) {
  const [form, setForm] = useState(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const errors = validate(form);
  const err = (k) => submitted && errors[k];
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;
    // No backend route for inquiries: confirm to the user and reset the form.
    onSent("Inquiry sent. Support will reply by email.");
    setForm(EMPTY);
    setSubmitted(false);
  }

  return (
    <section className="page">
      <div className="contact-layout">
        <form className="panel" noValidate onSubmit={handleSubmit}>
          <h1>Contact support</h1>
          <p className="muted">Send a question to the hospital support desk.</p>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="c-name">Your name</label>
              <input id="c-name" value={form.name} onChange={set("name")} className={err("name") ? "invalid" : ""} />
              {err("name") && <span className="error-text">{errors.name}</span>}
            </div>
            <div className="field">
              <label htmlFor="c-email">Email</label>
              <input id="c-email" type="email" value={form.email} onChange={set("email")} className={err("email") ? "invalid" : ""} />
              {err("email") && <span className="error-text">{errors.email}</span>}
            </div>
            <div className="field span-2">
              <label htmlFor="c-topic">Topic</label>
              <select id="c-topic" value={form.topic} onChange={set("topic")} className={err("topic") ? "invalid" : ""}>
                <option value="">Select a topic</option>
                {TOPICS.map((t) => <option key={t}>{t}</option>)}
              </select>
              {err("topic") && <span className="error-text">{errors.topic}</span>}
            </div>
            <div className="field span-2">
              <label htmlFor="c-msg">Message</label>
              <textarea id="c-msg" rows="4" value={form.message} onChange={set("message")} className={err("message") ? "invalid" : ""} />
              {err("message") && <span className="error-text">{errors.message}</span>}
            </div>
          </div>
          <div className="modal-actions"><button className="btn btn-primary" type="submit">Send inquiry</button></div>
        </form>

        <div>
          <h2 className="section-title">Ward and emergency directory</h2>
          <div className="directory">
            {DIRECTORY.map((d) => (
              <div key={d.name} className={`panel hover-lift dir-card ${d.urgent ? "dir-urgent" : ""}`}>
                <div className="strong">{d.name}</div>
                <div className="dir-ext">{d.ext}</div>
                <div className="subtle">{d.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
