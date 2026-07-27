import assert from "node:assert/strict";
import {
  BASE_EXPECTED_SAVINGS,
  EXPECTED_SAVINGS_BY_TYPE,
  clampSavingsRate,
  consumptionAdjustment,
  expectedSavingsRatePercent,
  fleetSizeAdjustment,
  mileageAdjustment,
  monthlyFuelCost,
  monthlyFuelSavings,
} from "../src/lib/fuelSavings.js";

assert.equal(EXPECTED_SAVINGS_BY_TYPE.car, 11);
assert.equal(EXPECTED_SAVINGS_BY_TYPE.minibus, 12.5);
assert.equal(EXPECTED_SAVINGS_BY_TYPE.truck, 14);
assert.equal(EXPECTED_SAVINGS_BY_TYPE.tractor, 15);
assert.equal(BASE_EXPECTED_SAVINGS, 13);

assert.equal(fleetSizeAdjustment(1), 0);
assert.equal(fleetSizeAdjustment(5), 0);
assert.equal(fleetSizeAdjustment(6), 0.5);
assert.equal(fleetSizeAdjustment(15), 0.5);
assert.equal(fleetSizeAdjustment(16), 1);
assert.equal(fleetSizeAdjustment(31), 1.5);
assert.equal(fleetSizeAdjustment(51), 1.8);
assert.equal(fleetSizeAdjustment(101), 2);

assert.equal(mileageAdjustment(500), -2);
assert.equal(mileageAdjustment(1000), -2);
assert.equal(mileageAdjustment(1001), 0);
assert.equal(mileageAdjustment(3000), 0);
assert.equal(mileageAdjustment(3001), 2);
assert.equal(mileageAdjustment(6000), 2);
assert.equal(mileageAdjustment(6001), 3);

assert.equal(consumptionAdjustment(8), 0);
assert.equal(consumptionAdjustment(9), 0.3);
assert.equal(consumptionAdjustment(15), 0.3);
assert.equal(consumptionAdjustment(16), 0.6);
assert.equal(consumptionAdjustment(25), 0.6);
assert.equal(consumptionAdjustment(26), 1);

assert.equal(clampSavingsRate(4), 5);
assert.equal(clampSavingsRate(21), 20);
assert.equal(clampSavingsRate(13), 13);

// Базовий приклад: 5 вантажівок, 30 л/100, 5000 км, дизель 55 грн
// M=14, ΔK=0, ΔM=+2, ΔP=+1 → 17%
// C = 30/100 * 5000 * 5 * 55 = 412500
// E = 412500 * 0.17 = 70125
const sample = monthlyFuelSavings({ type: "truck", count: 5, fuel: 30, kmPerMonth: 5000 });
assert.equal(sample.ratePercent, 17);
assert.equal(sample.cost, 412500);
assert.equal(sample.savings, 70125);

assert.equal(
  monthlyFuelCost({ type: "car", count: 1, fuel: 8, kmPerMonth: 1000 }),
  (8 / 100) * 1000 * 1 * 58,
);

// Обмеження max 20%
assert.equal(
  expectedSavingsRatePercent({ type: "tractor", count: 120, fuel: 40, kmPerMonth: 7000 }),
  20,
);

console.log("fuel savings checks passed");
