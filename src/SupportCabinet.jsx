import { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { site } from "./data.js";

const MAX_FILE_SIZE = 1048576; // 1MB
const MAX_FILES_COUNT = 5;
const MAX_MESSAGE_LENGTH = 5000;
const ACCEPTED_EXTENSIONS = ["jpg", "jpeg", "png", "pdf", "doc", "docx"];

const SUPPORT_SUBMIT_URL =
  (import.meta.env.VITE_SUPPORT_API_URL || `${site.baseUrl}/client-nexus-portal/process.php`).replace(
    /\/$/,
    "",
  ) || `${site.baseUrl}/client-nexus-portal/process.php`;

function pushEvent(event, payload = {}) {
  window.dataLayer = window.dataLayer || [];
  window.dataLayer.push({ event, ...payload });
}

function isValidPhone(phone) {
  return /^[\+]?[0-9\s\-\(\)]{10,20}$/.test(String(phone || "").trim());
}

function getFileIcon(filename) {
  const ext = filename.split(".").pop()?.toLowerCase() || "";
  const icons = {
    jpg: "🖼",
    jpeg: "🖼",
    png: "🖼",
    pdf: "📄",
    doc: "📝",
    docx: "📝",
  };
  return icons[ext] || "📎";
}

function escapeFileName(name) {
  return String(name || "").replace(/[<>&"']/g, "");
}

const emptyForm = {
  company: "",
  full_name: "",
  phone: "",
  message: "",
  company_site: "",
};

export function SupportCabinetModal({ open, onClose }) {
  const titleId = useId();
  const firstFieldRef = useRef(null);
  const fileInputRef = useRef(null);
  const [form, setForm] = useState(emptyForm);
  const [files, setFiles] = useState([]);
  const [errors, setErrors] = useState({});
  const [fileHelp, setFileHelp] = useState("Оберіть файли для завантаження");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // null | success | error
  const [statusMessage, setStatusMessage] = useState("");

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
    if (!open) return;
    setForm(emptyForm);
    setFiles([]);
    setErrors({});
    setFileHelp("Оберіть файли для завантаження");
    setSubmitting(false);
    setStatus(null);
    setStatusMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
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
      setErrors((current) => ({
        ...current,
        files: `Максимальна кількість файлів — ${MAX_FILES_COUNT}`,
      }));
      return;
    }

    for (const file of selected) {
      const ext = file.name.split(".").pop()?.toLowerCase() || "";
      if (!ACCEPTED_EXTENSIONS.includes(ext)) {
        event.target.value = "";
        setFiles([]);
        setFileHelp("Оберіть файли для завантаження");
        setErrors((current) => ({
          ...current,
          files: `Файл "${file.name}" має непідтримуваний формат`,
        }));
        return;
      }
      if (file.size > MAX_FILE_SIZE) {
        event.target.value = "";
        setFiles([]);
        setFileHelp("Оберіть файли для завантаження");
        setErrors((current) => ({
          ...current,
          files: `Файл "${file.name}" занадто великий. Максимум 1 МБ.`,
        }));
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
    if (!form.full_name.trim()) next.full_name = "Це поле обов'язкове для заповнення";
    if (!form.phone.trim()) next.phone = "Це поле обов'язкове для заповнення";
    else if (!isValidPhone(form.phone)) next.phone = "Невірний формат телефону";
    if (!form.message.trim()) next.message = "Це поле обов'язкове для заповнення";
    else if (form.message.length > MAX_MESSAGE_LENGTH) {
      next.message = `Максимальна довжина повідомлення: ${MAX_MESSAGE_LENGTH} символів`;
    }
    if (files.length > MAX_FILES_COUNT) {
      next.files = `Максимальна кількість файлів — ${MAX_FILES_COUNT}`;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const submit = async (event) => {
    event.preventDefault();
    if (form.company_site) return;
    if (!validate()) {
      const firstInvalid = event.currentTarget.querySelector("[aria-invalid='true'], .error-field");
      firstInvalid?.scrollIntoView({ behavior: "smooth", block: "center" });
      if (firstInvalid?.focus) firstInvalid.focus();
      return;
    }

    const body = new FormData();
    body.append("company", form.company.trim());
    body.append("full_name", form.full_name.trim());
    body.append("phone", form.phone.trim());
    body.append("message", form.message.trim());
    files.forEach((file) => body.append("files[]", file));

    setSubmitting(true);
    setStatus(null);
    setStatusMessage("");
    pushEvent("form_submit", { form_name: "support_cabinet" });
    pushEvent("Contact", { type: "client_portal_submit" });

    try {
      const response = await fetch(SUPPORT_SUBMIT_URL, {
        method: "POST",
        body,
        headers: {
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
      });

      let payload = null;
      const contentType = response.headers.get("content-type") || "";
      if (contentType.includes("application/json")) {
        payload = await response.json();
      } else {
        const text = await response.text();
        try {
          payload = JSON.parse(text);
        } catch {
          payload = { success: response.ok, raw: text };
        }
      }

      if (!response.ok || payload?.success === false) {
        const message =
          payload?.error ||
          payload?.message ||
          (response.status === 429
            ? "Перевищено ліміт заявок. Спробуйте пізніше (макс. 5 на годину)."
            : "Не вдалося надіслати заявку. Спробуйте ще раз або зателефонуйте в техпідтримку.");
        setStatus("error");
        setStatusMessage(message);
        return;
      }

      setStatus("success");
      setStatusMessage(payload?.message || "Заявку прийнято. Ми зв'яжемося з вами найближчим часом.");
      setForm(emptyForm);
      setFiles([]);
      setFileHelp("Оберіть файли для завантаження");
      if (fileInputRef.current) fileInputRef.current.value = "";
      pushEvent("generate_lead", { form_name: "support_cabinet" });
    } catch (error) {
      console.warn("Support cabinet submit failed", error);
      setStatus("error");
      setStatusMessage("Немає зв'язку з сервером. Перевірте інтернет або зателефонуйте в техпідтримку.");
    } finally {
      setSubmitting(false);
    }
  };

  const messageLength = form.message.length;
  const messageWarn = messageLength > MAX_MESSAGE_LENGTH * 0.9;

  return createPortal(
    <div className="cabinet-overlay" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose?.()}>
      <div
        className="cabinet-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <button className="cabinet-close" type="button" aria-label="Закрити Online-кабінет" onClick={onClose}>
          <span aria-hidden="true">×</span>
        </button>

        <div className="cabinet-head">
          <p className="cabinet-kicker">Техпідтримка КМ Трейд</p>
          <h2 id={titleId} className="cabinet-title">
            Online-кабінет
          </h2>
          <p className="cabinet-sub">
            Опишіть проблему з GPS-обладнанням або сервісом — додайте фото чи документи за потреби. Відповімо в робочий час.
          </p>
        </div>

        {status === "success" ? (
          <div className="cabinet-success" role="status" aria-live="polite">
            <div className="cabinet-success-icon" aria-hidden="true">
              ✓
            </div>
            <h3>Заявку надіслано</h3>
            <p>{statusMessage}</p>
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
                }}
              >
                Нова заявка
              </button>
            </div>
          </div>
        ) : (
          <form className="cabinet-form" id="supportForm" onSubmit={submit} noValidate>
            <input
              type="text"
              name="company_site"
              className="hp"
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              value={form.company_site}
              onChange={(event) => update("company_site", event.target.value)}
            />

            <div className="form-row">
              <div className={`form-field${errors.company ? " is-invalid" : ""}`}>
                <label htmlFor="cabinet-company">Компанія</label>
                <input
                  ref={firstFieldRef}
                  id="cabinet-company"
                  name="company"
                  type="text"
                  autoComplete="organization"
                  placeholder="ТОВ «Приклад»"
                  value={form.company}
                  onChange={(event) => update("company", event.target.value)}
                  aria-invalid={errors.company ? "true" : "false"}
                  className={errors.company ? "error-field" : undefined}
                  required
                />
                {errors.company ? (
                  <p className="form-error field-error" role="alert">
                    {errors.company}
                  </p>
                ) : null}
              </div>
              <div className={`form-field${errors.full_name ? " is-invalid" : ""}`}>
                <label htmlFor="cabinet-full-name">ПІБ</label>
                <input
                  id="cabinet-full-name"
                  name="full_name"
                  type="text"
                  autoComplete="name"
                  placeholder="Іван Іванов"
                  value={form.full_name}
                  onChange={(event) => update("full_name", event.target.value)}
                  aria-invalid={errors.full_name ? "true" : "false"}
                  className={errors.full_name ? "error-field" : undefined}
                  required
                />
                {errors.full_name ? (
                  <p className="form-error field-error" role="alert">
                    {errors.full_name}
                  </p>
                ) : null}
              </div>
            </div>

            <div className={`form-field${errors.phone ? " is-invalid" : ""}`}>
              <label htmlFor="cabinet-phone">Телефон</label>
              <input
                id="cabinet-phone"
                name="phone"
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="+38 050 123 45 67"
                value={form.phone}
                onChange={(event) => update("phone", event.target.value)}
                onBlur={() => {
                  if (form.phone && !isValidPhone(form.phone)) {
                    setErrors((current) => ({ ...current, phone: "Невірний формат телефону" }));
                  }
                }}
                aria-invalid={errors.phone ? "true" : "false"}
                className={errors.phone ? "error-field" : undefined}
                required
              />
              {errors.phone ? (
                <p className="form-error field-error" role="alert">
                  {errors.phone}
                </p>
              ) : null}
            </div>

            <div className={`form-field${errors.message ? " is-invalid" : ""}`}>
              <label htmlFor="cabinet-message">Повідомлення</label>
              <textarea
                id="cabinet-message"
                name="message"
                rows={5}
                maxLength={MAX_MESSAGE_LENGTH}
                placeholder="Опишіть проблему або запит…"
                value={form.message}
                onChange={(event) => update("message", event.target.value)}
                aria-invalid={errors.message ? "true" : "false"}
                className={errors.message ? "error-field" : undefined}
                required
              />
              <div className={`cabinet-char-count${messageWarn ? " warning" : ""}`}>
                <span id="message-count">{messageLength}</span> / {MAX_MESSAGE_LENGTH}
              </div>
              {errors.message ? (
                <p className="form-error field-error" role="alert">
                  {errors.message}
                </p>
              ) : null}
            </div>

            <div className={`form-field cabinet-files${errors.files ? " is-invalid" : ""}`}>
              <label htmlFor="fileInput">Файли (до {MAX_FILES_COUNT}, макс. 1 МБ кожен)</label>
              <input
                ref={fileInputRef}
                id="fileInput"
                name="files[]"
                type="file"
                accept=".jpg,.jpeg,.png,.pdf,.doc,.docx,image/jpeg,image/png,application/pdf"
                multiple
                onChange={onFilesChange}
              />
              <p className="cabinet-file-help" id="file-help">
                {fileHelp}
              </p>
              <div className="cabinet-file-list" id="fileList" aria-live="polite">
                {files.length > 0 ? (
                  <ul>
                    {files.map((file) => (
                      <li key={`${file.name}-${file.size}-${file.lastModified}`} role="listitem">
                        <span className="file-icon" aria-hidden="true">
                          {getFileIcon(file.name)}
                        </span>
                        <span className="file-name">{escapeFileName(file.name)}</span>
                        <span className="file-size">({(file.size / 1024).toFixed(1)} KB)</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
              {errors.files ? (
                <p className="form-error field-error" role="alert">
                  {errors.files}
                </p>
              ) : null}
            </div>

            {status === "error" ? (
              <p className="cabinet-form-error" role="alert">
                {statusMessage}
              </p>
            ) : null}

            <button className="btn btn-primary form-submit" id="submitBtn" type="submit" disabled={submitting}>
              <span className="btn-text" style={{ display: submitting ? "none" : "inline" }}>
                Надіслати заявку →
              </span>
              <span className="btn-loader" style={{ display: submitting ? "inline" : "none" }}>
                Надсилаємо…
              </span>
            </button>
            <p className="form-note">
              Ліміт: до 5 заявок на годину з одного IP · Тел. техпідтримки:{" "}
              <a href={`tel:${site.phoneSupport}`}>{site.phoneDisplaySupport}</a>
            </p>
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
