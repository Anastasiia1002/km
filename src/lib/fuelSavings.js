/**
 * Калькулятор щомісячного заощадження пального (KM Trade).
 * Формула як у таблиці «Калькулятор»:
 * E = (% економії) × (собівартість м/год) / 100 × к-ть × годин/добу × днів/місяць
 */

export const VEHICLE_TYPES = [
  {
    id: "car",
    label: "Легкові авто",
    costPerHour: 430,
    savingsPercent: 12.5,
    breakdown: [
      { percent: 7, label: "ліквідація нецільового пробігу" },
      { percent: 3.5, label: "Eco-Driving (швидкість/стиль)" },
      { percent: 2, label: "точність обліку та ТО" },
    ],
  },
  {
    id: "van",
    label: "Буси (малотоннажні)",
    costPerHour: 640,
    savingsPercent: 15,
    breakdown: [
      { percent: 6, label: "запобігання зливам/недоливам" },
      { percent: 5, label: "оптимізація маршрутів доставки" },
      { percent: 4, label: "ліквідація холостого ходу" },
    ],
  },
  {
    id: "truck",
    label: "Вантажівки (тягачі / TIR)",
    costPerHour: 2180,
    savingsPercent: 18,
    breakdown: [
      { percent: 8, label: "ДУТ (контроль зливів та «обратки»)" },
      { percent: 5, label: "виключення фіктивних чеків" },
      { percent: 5, label: "Eco-Driving на трасі" },
    ],
  },
  {
    id: "construction",
    label: "Будівельна техніка",
    costPerHour: 1615,
    savingsPercent: 24,
    breakdown: [
      { percent: 10, label: "облік мотогодин під навантаженням" },
      { percent: 8, label: "виявлення зливів спецтехніки" },
      { percent: 6, label: "припинення робіт «на сторону»" },
    ],
  },
  {
    id: "agro",
    label: "Сільгосптехніка",
    costPerHour: 3030,
    savingsPercent: 22,
    breakdown: [
      { percent: 9, label: "контроль площі та перекриттів" },
      { percent: 7, label: "ДРП та проточні лічильники" },
      { percent: 6, label: "виключення зливів при заправці" },
    ],
  },
];

export const VEHICLE_BY_ID = Object.fromEntries(VEHICLE_TYPES.map((item) => [item.id, item]));

export const HOURS_PER_DAY_MIN = 1;
export const HOURS_PER_DAY_MAX = 24;
export const DAYS_PER_MONTH_MIN = 1;
export const DAYS_PER_MONTH_MAX = 30;

export function getVehicleType(type) {
  return VEHICLE_BY_ID[type] ?? VEHICLE_BY_ID.truck;
}

export function formatPercent(value) {
  return Number.isInteger(value) ? String(value) : String(value).replace(".", ",");
}

/**
 * Щомісячна економія:
 * savingsPercent × costPerHour / 100 × count × hoursPerDay × daysPerMonth
 */
export function monthlyFuelSavings({ type, count, hoursPerDay, daysPerMonth }) {
  const vehicle = getVehicleType(type);
  const qty = Math.max(0, Number(count) || 0);
  const hours = Math.min(HOURS_PER_DAY_MAX, Math.max(HOURS_PER_DAY_MIN, Number(hoursPerDay) || HOURS_PER_DAY_MIN));
  const days = Math.min(DAYS_PER_MONTH_MAX, Math.max(DAYS_PER_MONTH_MIN, Number(daysPerMonth) || DAYS_PER_MONTH_MIN));
  const monthlyCost = vehicle.costPerHour * qty * hours * days;
  const savings = (vehicle.savingsPercent * vehicle.costPerHour / 100) * qty * hours * days;

  return {
    costPerHour: vehicle.costPerHour,
    ratePercent: vehicle.savingsPercent,
    breakdown: vehicle.breakdown,
    monthlyCost,
    savings: Math.round(savings),
  };
}
