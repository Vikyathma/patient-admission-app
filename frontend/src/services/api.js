// API helper. Base URL comes from VITE_API_URL (falls back to the local backend).
const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
// Turns backend error bodies into one readable message.
// Our backend sends {"detail": "text"}; FastAPI's default is a list of {msg}.
function parseError(body, status) {
  const detail = body && body.detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((d) => (d.msg || "Invalid input").replace(/^Value error, /, "")).join(". ");
  }
  return `Request failed (${status})`;
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      ...options,
    });
  } catch {
    throw new Error("Cannot reach the server. Check that the backend is running.");
  }
  const body = await res.json().catch(() => null);
  if (!res.ok) throw new Error(parseError(body, res.status));
  return body;
}

export const getPatients = () => request("/patients");
export const createPatient = (p) => request("/patients", { method: "POST", body: JSON.stringify(p) });
export const updatePatient = (id, p) => request(`/patients/${id}`, { method: "PUT", body: JSON.stringify(p) });
export const dischargePatient = (id) => request(`/patients/${id}/discharge`, { method: "PATCH" });
export const deletePatient = (id) => request(`/patients/${id}`, { method: "DELETE" });
