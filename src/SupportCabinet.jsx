import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { site } from "./data.js";

const MAX_FILE_SIZE = 1048576;
const MAX_FILES_COUNT = 5;
const MAX_MESSAGE_LENGTH = 5000;
const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf", "doc", "docx"];

const PORTAL_BASE = site.clientPortalUrl.replace(/\/?$/, "/");
const CSRF_URL = `${PORTAL_BASE}csrf.php`;
const SUBMIT_URL = `${PORTAL_BASE}index.php`;
const HEALTH_URL = `${PORTAL_BASE}health.php`;

function pushEvent(event, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

function getFileIcon(filename) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const icons = { jpg: "🖼", jpeg: "🖼", png: "🖼", pdf: "📄", doc: "📝", docx: "📝" };
  return icons[ext] || "📎";
}

const emptyForm = { company: "", name: "", phone: "", message: "" };

function normalizePhone(phone) {
  return String(phone || "").trim();
}

function isValidPhone(phone) {
  const value = normalizePhone(phone);
  if (!value) return false;
  if (/^\+380\d{9}$/.test(value)) return true;
  if (/^380\d{9}$/.test(value)) return true;
  if (/^0\d{9}$/.test(value)) return true;
  return /^[\+]?[0-9\s\-\(\)]{10,20}$/.test(value);
}

function scrollToFirstCabinetError() {
  const target =
    document.querySelector("#cabinet-support-form .form-error") ||
    document.querySelector("#cabinet-support-form .is-invalid input, #cabinet-support-form .is-invalid textarea");
  target?.scrollIntoView({ behavior: "smooth", block: "center" });
}

async function readJsonSafe(response) {
  const text = await response.text();
  if (contentType.includes("application/json")) {
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }
  // SPA catch-all returns HTML — treat as portal down
  if (text.trimStart().startsWith("<!doctype") || text.trimStart().startsWith("<html")) {
    return null;
  }
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export function SupportCabinetModal({ open, onClose }) {
  const titleId = useId();
  const firstFieldRef = useRef(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [fileHelp, setFileHelp] = useState("Оберіть файли для завантаження");
  const [submitting, setSubmitting] = useState(false);
  const [csrfToken, setCsrfToken] = useState("");
  const [portalReady, setPortalReady] = useState(null); // null | true | false
  const [status, setStatus] = useState(null);
  const [statusMessage, setStatusMessage] = useState("");
  const [requestId, setRequestId] = useState(null);

  useEffect(() => {
    if (!open) return undefined;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const timer = window.setTimeout(() => firstFieldRef.current?.focus(), 40);
    const onKeyDown = (event) => {
      if (event.key === "Escape") onClose?.();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.clearTimeout(timer);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return undefined;

    setForm(emptyForm);
    setFiles([]);
    setErrors({});
    setFileHelp("Оберіть файли для завантаження");
    setSubmitting(false);
    setStatus(null);
    setStatusMessage("");
    setRequestId(null);
    setCsrfToken("");
    setPortalReady(null);
    if (fileInputRef.current) fileInputRef.current.value = "";

    let cancelled = false;

    (async () => {
      try {
        const health = await fetch(HEALTH_URL, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const healthJson = await readJsonSafe(health);
        if (cancelled) return;
        if (!health.ok || !healthJson?.ok || healthJson?.portal !== "client-nexus-portal") {
          setPortalReady(false);
          return;
        }

        const csrf = await fetch(CSRF_URL, {
          method: "GET",
          credentials: "include",
          headers: { Accept: "application/json" },
          cache: "no-store",
        });
        const csrfJson = await readJsonSafe(csrf);
        if (cancelled) return;
        if (!csrf.ok || !csrfJson?.csrf_token) {
          setPortalReady(false);
          return;
        }
        setCsrfToken(csrfJson.csrf_token);
        setPortalReady(true);
      } catch {
        if (!cancelled) setPortalReady(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open]);

  if (!open) return null;

  const update = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  };

  const onFilesChange = (event) => {
    const selected = Array.from(event.target.files || []);
    if (selected.length === 0) {
      setFiles([]);
      setFileHelp("Оберіть файли для завантаження");
      return;
    }
    if (selected.length > MAX_FILES_COUNT) {
      event.target.value = "";
      setFiles([]);
      setFileHelp("Оберіть файли для завантаження");
      setErrors((current) => ({ ...current, files: `Максимальна кількість файлів — ${MAX_FILES_COUNT}` }));
      return;
    }
    for (const file of selected) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        event.target.value = "";
        setFiles([]);
        setFileHelp("Оберіть файли для завантаження");
        setErrors((current) => ({ ...current, files: `Файл "${file.name}" має непідтримуваний формат` }));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        event.target.value = "";
        setFiles([]);
        setFileHelp("Оберіть файли для завантаження");
        setErrors((current) => ({ ...current, files: `Файл "${file.name}" занадто великий. Максимум 1 МБ.` }));
        return;
      }
    }
    setFiles(selected);
    setFileHelp(`Обрано файлів: ${selected.length}`);
    setErrors((current) => {
      if (!current.files) return current;
      const next = { ...current };
      delete next.files;
      return next;
    });
  };

  const validate = () => {
    const next = {};
    if (!form.company.trim()) next.company = "Це поле обов'язкове для заповнення";
    if (!form.name.trim()) next.name = "Це поле обов'язкове для заповнення";
    if (!form.phone.trim()) next.phone = "Це поле обов'язкове для заповнення";
    else if (!isValidPhone(form.phone)) next.phone = "Невірний формат телефону";
    if (!form.message.trim()) next.message = "Це поле обов'язкове для заповнення";
    else if (form.message.length > MAX_MESSAGE_LENGTH) {
      next.message = `Максимальна довжина повідомлення: ${MAX_MESSAGE_LENGTH} символів`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!validate()) {
      setStatus("error");
      setStatusMessage("Перевірте виділені поля форми.");
      scrollToFirstCabinetError();
      return;
    }
    if (!portalReady || !csrfToken) {
      setStatus("error");
      setStatusMessage(
        `Online-кабінет на сервері ще не підключений. Зателефонуйте в техпідтримку: ${site.phoneDisplaySupport}`,
      );
      scrollToFirstCabinetError();
      return;
    }

    const body = new FormData();
    body.append("csrf_token", csrfToken);
    body.append("company", form.company.trim());
    body.append("name", form.name.trim());
    body.append("phone", form.phone.trim());
    body.append("message", form.message.trim());
    files.forEach((file) => body.append("files[]", file));

    setSubmitting(true);
    setStatus(null);
    setStatusMessage("");
    pushEvent("form_submit", { form_name: "support_cabinet" });
    pushEvent("Contact", { type: "client_portal_submit" });

    try {
      const response = await fetch(SUBMIT_URL, {
        method: "POST",
        body,
        credentials: "include",
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });
      const payload = await readJsonSafe(response);

      if (!payload) {
        setPortalReady(false);
        setStatus("error");
        setStatusMessage(
          `Портал недоступний (сервер віддає сайт замість PHP). Зателефонуйте: ${site.phoneDisplaySupport}`,
        );
        return;
      }

      if (!response.ok || payload.success === false) {
        if (payload.fields && typeof payload.fields === "object") {
          setErrors(payload.fields);
        }
        setStatus("error");
        setStatusMessage(payload.error || payload.message || "Не вдалося надіслати заявку.");
        return;
      }

      setStatus("success");
      setStatusMessage(payload.message || "Ваша заявка успішно надіслана.");
      setRequestId(payload.id || null);
      setForm(emptyForm);
      setFiles([]);
      setFileHelp("Оберіть файли для завантаження");
      if (fileInputRef.current) fileInputRef.current.value = "";
      pushEvent("generate_lead", { form_name: "support_cabinet" });
    } catch (error) {
      console.warn("Support cabinet submit failed", error);
      setStatus("error");
      setStatusMessage(`Немає зв'язку з сервером. Тел. техпідтримки: ${site.phoneDisplaySupport}`);
    } finally {
      setSubmitting(false);
    }
  };

  const messageLength = form.message.length;
  const messageWarn = messageLength > MAX_MESSAGE_LENGTH * 0.9;

  return createPortal(
    <div className="cabinet-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <div className="cabinet-dialog" role="dialog" aria-modal="true" aria-labelledby={titleId}>
        <button className="cabinet-close" type="button" aria-label="Закрити Online-кабінет" onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>

        <div className="cabinet-head">
          <p className="cabinet-kicker">Техпідтримка КМ Трейд</p>
          <h2 id={titleId} className="cabinet-title">
            Online-кабінет
          </h2>
          <p className="cabinet-sub">
            Шановний клієнт! Заповніть форму або зателефонуйте за номером{" "}
            <a href={`tel:${site.phoneSupport}`}>{site.phoneDisplaySupport}</a>.
          </p>
        </div>

        {portalReady === false ? (
          <div className="cabinet-form-error" role="alert">
            URL <code>/client-nexus-portal/</code> зараз недоступний: nginx віддає головний сайт замість PHP.
            Потрібно викласти папку порталу на сервер і додати nginx location (див.{" "}
            <code>client-nexus-portal/nginx.snippet.conf</code>). Тим часом телефонуйте{" "}
            <a href={`tel:${site.phoneSupport}`}>{site.phoneDisplaySupport}</a>.
          </div>
        ) : null}

        {status === "success" ? (
          <div className="cabinet-success" role="status" aria-live="polite">
            <div className="cabinet-success-icon" aria-hidden="true">
              ✓
            </div>
            <h3>Дякуємо!</h3>
            <p>{statusMessage}</p>
            {requestId ? <p><strong>Номер заявки: #{requestId}</strong></p> : null}
            <div className="cabinet-success-actions">
              <button className="btn btn-primary" type="button" onClick={onClose}>
                Закрити
              </button>
              <button
                className="btn btn-outline"
                type="button"
                onClick={() => {
                  setStatus(null);
                  setStatusMessage("");
                  setRequestId(null);
                }}
              >
                Надіслати ще одну
              </button>
            </div>
          </div>
        ) : (
          <form className="cabinet-form" id="cabinet-support-form" onSubmit={submit} noValidate>
            <div className={`form-field${errors.company ? " is-invalid" : ""}`}>
              <label htmlFor="cabinet-company">Компанія *</label>
              <input
                ref={firstFieldRef}
                id="cabinet-company"
                name="company"
                type="text"
                placeholder="KM-Trade"
                maxLength={255}
                value={form.company}
                onChange={(event) => update("company", event.target.value)}
                aria-invalid={errors.company ? "true" : "false"}
                className={errors.company ? "error-field" : undefined}
                required
              />
              {errors.company ? <p className="form-error" role="alert">{errors.company}</p> : null}
            </div>

            <div className={`form-field${errors.name ? " is-invalid" : ""}`}>
              <label htmlFor="cabinet-name">ПІБ контактної особи *</label>
              <input
                id="cabinet-name"
                name="name"
                type="text"
                placeholder="Шевченко Тарас"
                maxLength={255}
                value={form.name}
                onChange={(event) => update("name", event.target.value)}
                aria-invalid={errors.name ? "true" : "false"}
                className={errors.name ? "error-field" : undefined}
                required
              />
              {errors.name ? <p className="form-error" role="alert">{errors.name}</p> : null}
            </div>

            <div className={`form-field${errors.phone ? " is-invalid" : ""}`}>
              <label htmlFor="cabinet-phone">Телефон *</label>
              <input
                id="cabinet-phone"
                name="phone"
                type="tel"
                placeholder="+380..."
                maxLength={20}
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                aria-invalid={errors.phone ? "true" : "false"}
                className={errors.phone ? "error-field" : undefined}
                required
              />
              {errors.phone ? <p className="form-error" role="alert">{errors.phone}</p> : null}
            </div>

            <div className={`form-field${errors.message ? " is-invalid" : ""}`}>
              <label htmlFor="cabinet-message">Коментар *</label>
              <textarea
                id="cabinet-message"
                name="message"
                rows={6}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Опишіть деталі ситуації..."
                value={form.message}
                onChange={(event) => update("message", event.target.value)}
                aria-invalid={errors.message ? "true" : "false"}
                className={errors.message ? "error-field" : undefined}
                required
              />
              <div className={`cabinet-char-count${messageWarn ? " warning" : ""}`}>
                <span id="message-count">{messageLength}</span> / {MAX_MESSAGE_LENGTH}
              </div>
              {errors.message ? <p className="form-error" role="alert">{errors.message}</p> : null}
            </div>

            <div className={`form-field cabinet-files${errors.files ? " is-invalid" : ""}`}>
              <label htmlFor="fileInput">Прикріпити файли (до {MAX_FILES_COUNT} шт, макс 1МБ кожен)</label>
              <input
                ref={fileInputRef}
                id="fileInput"
                name="files[]"
                type="file"
                accept=".jpg,.png,.jpeg,.pdf,.doc,.docx"
                multiple
                onChange={onFilesChange}
              />
              <p className="cabinet-file-help" id="file-help">
                {fileHelp}
              </p>
              <div className="cabinet-file-list" id="fileList">
                {files.length > 0 ? (
                  <ul>
                    {files.map((file) => (
                      <li key={`${file.name}-${file.size}-${file.lastModified}`}>
                        <span className="file-icon" aria-hidden="true">
                          {getFileIcon(file.name)}
                        </span>
                        <span className="file-name">{file.name}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {errors.files ? <p className="form-error" role="alert">{errors.files}</p> : null}
            </div>

            {status === "error" ? (
              <p className="cabinet-form-error" role="alert">
                {statusMessage}
              </p>
            ) : null}

            <button className="btn btn-primary form-submit" id="cabinet-submit-btn" type="submit" disabled={submitting || portalReady !== true}>
              <span className="btn-text" style={{ display: submitting ? "none" : "inline" }}>
                {portalReady === null ? "Підключення…" : "Відправити"}
              </span>
              <span className="btn-loader" style={{ display: submitting ? "inline" : "none" }}>
                Відправка…
              </span>
            </button>
          </form>
        )}
      </div>
    </div>,
    document.body,
  );
}

export function openSupportCabinet() {
  window.dispatchEvent(new Event("km:open-cabinet"));
}
