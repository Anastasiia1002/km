/**
 * Калькулятор щомісячного заощадження пального (KM Trade).
 * Ймовірнісна модель за відкритими даними / типовими показниками конкурентів.
 */

/** Математичне сподівання відсотка економії за типом транспорту. */
export const EXPECTED_SAVINGS_BY_TYPE = {
  car: 11, // легкові ≈ 11%
  minibus: 12.5, // мікроавтобуси ≈ 12.5%
  truck: 14, // вантажівки ≈ 14%
  tractor: 15, // спецтехніка ≈ 15%
};

/** Базова модель (усі типи) ≈ 13% — запасний варіант. */
export const BASE_EXPECTED_SAVINGS = 13;

const MIN_SAVINGS_RATE = 5;
const MAX_SAVINGS_RATE = 20;

export function fuelPricePerLiter(type) {
  return type === "car" ? 58 : 55;
}

/** ΔK — вплив кількості авто (відсоткові пункти). */
export function fleetSizeAdjustment(count) {
  if (count <= 5) return 0;
  if (count <= 15) return 0.5;
  if (count <= 30) return 1;
  if (count <= 50) return 1.5;
  if (count <= 100) return 1.8;
  return 2;
}

/** ΔM — вплив місячного пробігу одного авто, км (відсоткові пункти). */
export function mileageAdjustment(kmPerMonth) {
  if (kmPerMonth <= 1000) return -2;
  if (kmPerMonth <= 3000) return 0;
  if (kmPerMonth <= 6000) return 2;
  return 3;
}

/** ΔP — вплив витрати пального, л/100 км (відсоткові пункти). */
export function consumptionAdjustment(litersPer100km) {
  if (litersPer100km <= 8) return 0;
  if (litersPer100km <= 15) return 0.3;
  if (litersPer100km <= 25) return 0.6;
  return 1;
}

export function clampSavingsRate(rate) {
  return Math.min(MAX_SAVINGS_RATE, Math.max(MIN_SAVINGS_RATE, rate));
}

/**
 * Очікуваний відсоток економії з коригуваннями.
 * E% = M(X) + ΔK + ΔM + ΔP, обмеження 5% … 20%.
 * (ΔT вже враховано через окремі M(X) для типів транспорту.)
 */
export function expectedSavingsRatePercent({ type, count, fuel, kmPerMonth }) {
  const base = EXPECTED_SAVINGS_BY_TYPE[type] ?? BASE_EXPECTED_SAVINGS;
  const rate =
    base +
    fleetSizeAdjustment(count) +
    mileageAdjustment(kmPerMonth) +
    consumptionAdjustment(fuel);
  return clampSavingsRate(rate);
}

/**
 * Щомісячні витрати пального:
 * C = (витрата/100) × пробіг × кількість авто × ціна пального
 */
export function monthlyFuelCost({ type, count, fuel, kmPerMonth, pricePerLiter }) {
  const price = pricePerLiter ?? fuelPricePerLiter(type);
  return (fuel / 100) * kmPerMonth * count * price;
}

/**
 * Грошова економія: E = C × (E% / 100)
 */
export function monthlyFuelSavings(input) {
  const cost = monthlyFuelCost(input);
  const ratePercent = expectedSavingsRatePercent(input);
  return {
    cost,
    ratePercent,
    savings: Math.round(cost * (ratePercent / 100)),
  };
}
