// Patient list: table on desktop, structured cards below 768px (CSS switches between them).

// Pastel avatar palettes; the same name always gets the same colour.
const AVATARS = [
  ["#CCFBF1", "#0F766E"], ["#E0F2FE", "#0369A1"], ["#E0E7FF", "#4338CA"],
  ["#FCE7F3", "#BE185D"], ["#FEF3C7", "#B45309"], ["#DCFCE7", "#15803D"],
];

function initials(name) {
  return name.trim().split(/\s+/).slice(0, 2).map((w) => w[0].toUpperCase()).join("");
}

function Avatar({ name }) {
  const [bg, fg] = AVATARS[[...name].reduce((n, c) => n + c.charCodeAt(0), 0) % AVATARS.length];
  return <span className="avatar" style={{ background: bg, color: fg }}>{initials(name)}</span>;
}

function StatusBadge({ status }) {
  const admitted = status === "Admitted";
  return (
    <span className={`badge ${admitted ? "badge-admitted" : "badge-discharged"}`}>
      {admitted && <span className="pulse-dot" />}
      {status}
    </span>
  );
}

function Identity({ p }) {
  return (
    <div className="identity">
      <Avatar name={p.name} />
      <div>
        <div className="strong">{p.name}</div>
        <div className="subtle">{p.age} yrs &middot; {p.gender}</div>
      </div>
    </div>
  );
}

function Actions({ p, onEdit, onDischarge, onDelete }) {
  return (
    <div className="row-actions">
      {p.status === "Admitted" && <button className="btn btn-sm btn-soft" onClick={() => onDischarge(p)}>Discharge</button>}
      <button className="btn btn-sm btn-ghost" onClick={() => onEdit(p)}>Edit</button>
      <button className="btn btn-sm btn-danger-ghost" onClick={() => onDelete(p)}>Delete</button>
    </div>
  );
}

export default function PatientList({ patients, onEdit, onDischarge, onDelete }) {
  const h = { onEdit, onDischarge, onDelete };
  return (
    <>
      <div className="table-wrap">
        <table className="patient-table">
          <thead>
            <tr>
              <th>Patient</th><th>Ward</th><th>Department</th><th>Doctor</th>
              <th>Admission Date</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients.map((p) => (
              <tr key={p.id}>
                <td><Identity p={p} /></td>
                <td><span className="pill pill-teal">{p.ward}</span></td>
                <td><span className="pill pill-sky">{p.department}</span></td>
                <td><span className="pill pill-indigo">{p.doctor}</span></td>
                <td className="nowrap">{p.admission_date}</td>
                <td><StatusBadge status={p.status} /></td>
                <td><Actions p={p} {...h} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="card-list">
        {patients.map((p) => (
          <article className="patient-card" key={p.id}>
            <div className="patient-card-head">
              <Identity p={p} />
              <StatusBadge status={p.status} />
            </div>
            <div className="pill-row">
              <span className="pill pill-teal">{p.ward}</span>
              <span className="pill pill-sky">{p.department}</span>
              <span className="pill pill-indigo">{p.doctor}</span>
            </div>
            <div className="subtle">Admitted on {p.admission_date}</div>
            <Actions p={p} {...h} />
          </article>
        ))}
      </div>
    </>
  );
}
