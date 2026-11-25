// Custom confirmation dialog (replaces window.confirm) used before deleting a patient.
export default function ConfirmModal({ title, message, confirmLabel = "Delete", onConfirm, onCancel }) {
  return (
    <div className="modal-backdrop" onClick={onCancel}>
      <div className="modal modal-sm" role="alertdialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
        <div className="confirm-icon" aria-hidden="true">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14M10 11v5M14 11v5" />
          </svg>
        </div>
        <h2>{title}</h2>
        <p className="muted">{message}</p>
        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmLabel}</button>
        </div>
      </div>
    </div>
  );
}
