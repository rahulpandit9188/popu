import { useEffect, useRef } from 'react';

export default function AdminEditor({ open, saving, onClose, className = '', children }) {
  const dialogRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const dialog = dialogRef.current;
    const previousFocus = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    dialog.querySelector('h2')?.focus();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (previousFocus?.isConnected) previousFocus.focus({ preventScroll: true });
    };
  }, [open]);

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className={`admin-edit-dialog ${className}`.trim()}
      aria-labelledby="admin-editor-title"
      aria-describedby="admin-edit-path"
      onCancel={(event) => {
        event.preventDefault();
        if (!saving) onClose();
      }}
    >
      <button className="admin-dialog-close" type="button" aria-label="Close editor" disabled={saving} onClick={onClose}>
        <span aria-hidden="true">×</span>
      </button>
      {children}
    </dialog>
  );
}
