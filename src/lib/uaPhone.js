export const UA_PHONE_HINT = "Формат: +380 XX XXX XX XX, 380XXXXXXXXX або 0XXXXXXXXX";

export function normalizeUaPhoneDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

export function isValidUaPhone(value) {
  const digits = normalizeUaPhoneDigits(value);
  return /^0\d{9}$/.test(digits) || /^380\d{9}$/.test(digits);
}

export function getUaPhoneError(value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return "Це поле обов'язкове для заповнення";
  if (!isValidUaPhone(trimmed)) {
    return "Невірний формат. Вкажіть український номер: +380..., 380... або 0...";
  }
  return null;
}
