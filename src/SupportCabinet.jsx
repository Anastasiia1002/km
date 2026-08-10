import { useEffect, useId } from "react";
import { createPortal } from "react-dom";
import { site } from "./data.js";

const PORTAL_EMBED_URL = `${site.clientPortalUrl.replace(/\/?$/, "/")}index.php?embed=1`;

export function SupportCabinetModal({ open, onClose }) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div
      className="cabinet-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose?.();
      }}
    >
      <div className="cabinet-dialog cabinet-dialog--portal" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <div className="cabinet-portal-bar">
          <div>
            <p className="cabinet-kicker">Техпідтримка КМ Трейд</p>
            <h2 id={titleId} className="cabinet-title">
              Online-кабінет
            </h2>
          </div>
          <div className="cabinet-portal-actions">
            <a
              className="cabinet-open-tab"
              href={site.clientPortalUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              Відкрити на повну
            </a>
            <button className="cabinet-close" type="button" aria-label="Закрити Online-кабінет" onClick={onClose}>
              <span aria-hidden="true">×</span>
            </button>
          </div>
        </div>
        <iframe
          className="cabinet-frame"
          title="Заявка на технічну підтримку"
          src={PORTAL_EMBED_URL}
          loading="eager"
          referrerPolicy="no-referrer-when-downgrade"
        />
      </div>
    </div>,
    document.body,
  );
}

export function openSupportCabinet() {
  window.dispatchEvent(new Event("km:open-cabinet"));
}
