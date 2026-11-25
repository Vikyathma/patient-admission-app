import { useState } from "react";

// Allowed dropdown values (exported so App.jsx filters reuse them).
export const GENDERS = ["Male", "Female", "Other"];
export const WARDS = ["General Ward", "ICU", "Emergency", "Maternity", "Pediatrics", "Surgical"];
export const DEPARTMENTS = ["Cardiology", "Neurology", "Orthopedics", "General Medicine", "Pediatrics", "Oncology"];
export const DOCTORS = ["Dr. Aarav Sharma", "Dr. Priya Nair", "Dr. Rohan Kulkarni", "Dr. Sneha Rao", "Dr. Vikram Desai"];
const STATUSES = ["Admitted", "Discharged"];

const today = () => new Date().toISOString().slice(0, 10);
const EMPTY = { name: "", age: "", gender: "", ward: "", department: "", doctor: "", admission_date: today(), status: "Admitted" };

// Client-side validation: mirrors the backend rules exactly.
function validate(f) {
  const e = {};
  const name = f.name.trim();
  if (!name) e.name = "Name is required";
  else if (!/^[A-Za-z\s]+$/.test(name)) e.name = "Name can contain only letters and spaces";

  if (f.age === "" || f.age === null) e.age = "Age is required";
  else if (!/^\d+$/.test(String(f.age)) || Number(f.age) > 120) e.age = "Age must be a whole number between 0 and 120";

  if (!GENDERS.includes(f.gender)) e.gender = "Select a gender";
  if (!WARDS.includes(f.ward)) e.ward = "Select a ward";
  if (!DEPARTMENTS.includes(f.department)) e.department = "Select a department";
  if (!DOCTORS.includes(f.doctor)) e.doctor = "Select a doctor";

  if (!f.admission_date) e.admission_date = "Admission date is required";
  else if (f.admission_date > today()) e.admission_date = "Admission date cannot be in the future";

  if (!STATUSES.includes(f.status)) e.status = "Status must be Admitted or Discharged";
  return e;
}

export default function PatientFormModal({ patient, onSave, onClose }) {
  const editing = Boolean(patient);
  const [form, setForm] = useState(patient ? { ...patient } : EMPTY); // pre-filled when editing
  const [touched, setTouched] = useState({});   // fields the user has interacted with
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState("");

  // Errors are recalculated on every render, so messages update in real time.
  const errors = validate(form);
  const shown = (key) => (touched[key] || submitted) && errors[key];

  const set = (key) => (e) => {
    setForm({ ...form, [key]: e.target.value });
    setTouched({ ...touched, [key]: true });
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length) return;
    setSaving(true);
    setServerError("");
    try {
      await onSave({ ...form, name: form.name.trim(), age: Number(form.age) });
    } catch (err) {
      setServerError(err.message); // message from the backend
      setSaving(false);
    }
  }

  const input = (key, label, props = {}) => (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <input id={key} value={form[key]} onChange={set(key)} className={shown(key) ? "invalid" : ""} {...props} />
      {shown(key) && <span className="error-text">{errors[key]}</span>}
    </div>
  );

  const select = (key, label, options) => (
    <div className="field">
      <label htmlFor={key}>{label}</label>
      <select id={key} value={form[key]} onChange={set(key)} className={shown(key) ? "invalid" : ""}>
        <option value="">Select {label.toLowerCase()}</option>
        {options.map((o) => <option key={o}>{o}</option>)}
      </select>
      {shown(key) && <span className="error-text">{errors[key]}</span>}
    </div>
  );

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" noValidate onSubmit={handleSubmit} onClick={(e) => e.stopPropagation()}>
        <h2>{editing ? "Edit patient" : "Admit new patient"}</h2>
        <p className="muted modal-sub">All fields are required.</p>
        {serverError && <div className="alert-error">{serverError}</div>}

        <div className="form-grid">
          {input("name", "Name", { placeholder: "Full name" })}
          {input("age", "Age", { type: "number", placeholder: "0 - 120" })}
          {select("gender", "Gender", GENDERS)}
          {select("ward", "Ward", WARDS)}
          {select("department", "Department", DEPARTMENTS)}
          {select("doctor", "Doctor", DOCTORS)}
          {input("admission_date", "Admission Date", { type: "date", max: today() })}
          {select("status", "Status", STATUSES)}
        </div>

        <div className="modal-actions">
          <button type="button" className="btn btn-ghost" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? "Saving..." : editing ? "Save changes" : "Admit patient"}
          </button>
        </div>
      </form>
    </div>
  );
}
