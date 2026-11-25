import { useEffect, useMemo, useState } from "react";
import Navbar from "./components/Navbar";
import PatientList from "./components/PatientList";
import PatientFormModal, { WARDS, DEPARTMENTS, DOCTORS } from "./components/PatientFormModal";
import ConfirmModal from "./components/ConfirmModal";
import About from "./pages/About";
import Contact from "./pages/Contact";
import * as api from "./services/api";

const NO_FILTERS = { ward: "", department: "", doctor: "" };
const TABS = ["All", "Admitted", "Discharged"];

// Small inline SVG icons for the KPI cards
const Icon = ({ d }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d={d} /></svg>
);
const ICONS = {
  total: "M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2M10 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8M21 21v-2a4 4 0 0 0-3-3.9M16 3.1a4 4 0 0 1 0 7.8",
  admitted: "M3 12h4l3-8 4 16 3-8h4",
  discharged: "M20 6 9 17l-5-5",
  wards: "M3 21V7l9-4 9 4v14M9 21v-6h6v6",
};

export default function App() {
  const [view, setView] = useState("dashboard");
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState(NO_FILTERS);
  const [tab, setTab] = useState("All");
  const [formPatient, setFormPatient] = useState(undefined); // undefined = closed, null = new, object = editing
  const [toDelete, setToDelete] = useState(null);
  const [toast, setToast] = useState(null);

  function notify(message, type = "success") {
    setToast({ message, type, key: Date.now() });
    setTimeout(() => setToast(null), 3500);
  }

  async function load() {
    try {
      setPatients(await api.getPatients());
    } catch (err) {
      notify(err.message, "error");
    } finally {
      setLoading(false);
    }
  }
  useEffect(() => { load(); }, []);

  // Search + status tab + all three filters, applied together
  const visible = useMemo(() => {
    const q = search.trim().toLowerCase();
    return patients.filter((p) =>
      (!q || p.name.toLowerCase().includes(q)) &&
      (tab === "All" || p.status === tab) &&
      (!filters.ward || p.ward === filters.ward) &&
      (!filters.department || p.department === filters.department) &&
      (!filters.doctor || p.doctor === filters.doctor)
    );
  }, [patients, search, tab, filters]);

  const admitted = patients.filter((p) => p.status === "Admitted");
  const activeWards = new Set(admitted.map((p) => p.ward)).size;
  const hasFilters = search || tab !== "All" || Object.values(filters).some(Boolean);

  const resetAll = () => { setSearch(""); setTab("All"); setFilters(NO_FILTERS); };

  // Throws on failure so the form modal can show the backend message
  async function handleSave(data) {
    if (formPatient) {
      await api.updatePatient(formPatient.id, data);
      notify("Patient updated");
    } else {
      await api.createPatient(data);
      notify("Patient admitted");
    }
    setFormPatient(undefined);
    load();
  }

  async function handleDischarge(p) {
    try {
      await api.dischargePatient(p.id);
      notify("Marked as discharged");
      load();
    } catch (err) { notify(err.message, "error"); }
  }

  async function handleDelete() {
    try {
      await api.deletePatient(toDelete.id);
      notify("Patient deleted");
      load();
    } catch (err) { notify(err.message, "error"); }
    setToDelete(null);
  }

  const filterSelect = (key, label, options) => (
    <select aria-label={label} value={filters[key]} onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}>
      <option value="">All {label.toLowerCase()}s</option>
      {options.map((o) => <option key={o}>{o}</option>)}
    </select>
  );

  const kpis = [
    { label: "Total Patients", value: patients.length, icon: "total", tone: "teal" },
    { label: "Currently Admitted", value: admitted.length, icon: "admitted", tone: "green" },
    { label: "Discharged Patients", value: patients.length - admitted.length, icon: "discharged", tone: "slate" },
    { label: "Active Wards", value: activeWards, icon: "wards", tone: "indigo" },
  ];

  return (
    <>
      <Navbar view={view} onChange={setView} />
      <main className="container">
        {view === "about" && <About />}
        {view === "contact" && <Contact onSent={notify} />}

        {view === "dashboard" && (
          <>
            {/* Hero banner */}
            <section className="hero">
              <div>
                <span className="glass-badge glass-pill">Admissions desk</span>
                <h1>Patient Admission Dashboard</h1>
                <p>See who is admitted, where they are, and who is treating them.</p>
              </div>
              <button className="btn btn-cta" onClick={() => setFormPatient(null)}>+ Admit New Patient</button>
            </section>

            {/* KPI strip */}
            <div className="kpis">
              {kpis.map((k) => (
                <div key={k.label} className={`kpi kpi-${k.tone}`}>
                  <span className="kpi-icon"><Icon d={ICONS[k.icon]} /></span>
                  <div>
                    <div className="kpi-label">{k.label}</div>
                    <div className="kpi-value">{loading ? "-" : k.value}</div>
                  </div>
                </div>
              ))}
            </div>

            <section className="panel">
              {/* Toolbar */}
              <div className="toolbar">
                <div className="search-box">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></svg>
                  <input type="text" placeholder="Search by patient name" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search patients" />
                  {search && <button className="clear-btn" onClick={() => setSearch("")} aria-label="Clear search">&times;</button>}
                </div>
                {filterSelect("ward", "Ward", WARDS)}
                {filterSelect("department", "Department", DEPARTMENTS)}
                {filterSelect("doctor", "Doctor", DOCTORS)}
              </div>

              <div className="toolbar-row">
                <div className="tabs" role="tablist">
                  {TABS.map((t) => (
                    <button key={t} role="tab" aria-selected={tab === t} className={`tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>{t}</button>
                  ))}
                </div>
                <div className="result-count">
                  Showing {visible.length} of {patients.length} patients
                  <button className="btn btn-sm btn-ghost" onClick={resetAll} disabled={!hasFilters}>Reset Filters</button>
                </div>
              </div>

              {/* Loading skeleton / empty state / list */}
              {loading ? (
                <div className="skeletons" aria-label="Loading patients">
                  {[0, 1, 2, 3].map((i) => <div key={i} className="skeleton" />)}
                </div>
              ) : visible.length === 0 ? (
                <div className="empty">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3M8 11h6" /></svg>
                  <h3>{patients.length === 0 ? "No patients admitted yet" : "No patients match these filters"}</h3>
                  <p className="muted">{patients.length === 0 ? "Admit your first patient to get started." : "Try a different name or clear the filters."}</p>
                  {patients.length === 0
                    ? <button className="btn btn-primary" onClick={() => setFormPatient(null)}>+ Admit New Patient</button>
                    : <button className="btn btn-ghost" onClick={resetAll}>Reset Filters</button>}
                </div>
              ) : (
                <PatientList patients={visible} onEdit={setFormPatient} onDischarge={handleDischarge} onDelete={setToDelete} />
              )}
            </section>
          </>
        )}
      </main>

      {formPatient !== undefined && (
        <PatientFormModal patient={formPatient} onSave={handleSave} onClose={() => setFormPatient(undefined)} />
      )}
      {toDelete && (
        <ConfirmModal
          title="Delete this patient?"
          message={`${toDelete.name}'s record will be permanently removed. This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setToDelete(null)}
        />
      )}
      {toast && <div key={toast.key} className={`toast toast-${toast.type}`} role="status">{toast.message}</div>}
    </>
  );
}
