import { z } from "zod";
import { isValidUaPhone } from "./uaPhone.js";

export const LEAD_FLEET_OPTIONS = /** @type {const} */ ([
  "1-3 авто",
  "4-10 авто",
  "11-30 авто",
  "31-50 авто",
  "50+ авто",
]);

export const LEAD_FORM_FIELDS = /** @type {const} */ (["name", "phone", "cars", "region"]);

const requiredText = (message) => z.string().trim().min(1, message);

export const leadFormSchema = z.object({
  name: requiredText("Вкажіть ім'я"),
  phone: requiredText("Вкажіть телефон").refine(isValidUaPhone, {
    message: "Вкажіть номер у форматі +38 0XX XXX XX XX",
  }),
  cars: z.enum(LEAD_FLEET_OPTIONS, { error: "Оберіть кількість авто" }),
  region: requiredText("Оберіть регіон"),
});

export function collectLeadFormErrors(data) {
  const result = leadFormSchema.safeParse(data);
  if (result.success) return {};

  const errors = {};
  for (const issue of result.error.issues) {
    const field = String(issue.path[0] || "");
    if (field && errors[field] === undefined) errors[field] = issue.message;
  }
  return errors;
}

export function leadFieldError(field, value) {
  const result = leadFormSchema.pick({ [field]: true }).safeParse({ [field]: value });
  if (result.success) return "";
  return result.error.issues[0]?.message || "";
}
