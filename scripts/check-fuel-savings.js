import assert from "node:assert/strict";
import {
  DAYS_PER_MONTH_MAX,
  DAYS_PER_MONTH_MIN,
  HOURS_PER_DAY_MAX,
  HOURS_PER_DAY_MIN,
  VEHICLE_BY_ID,
  VEHICLE_TYPES,
  monthlyFuelSavings,
} from "../src/lib/fuelSavings.js";

assert.equal(VEHICLE_TYPES.length, 5);
assert.equal(VEHICLE_BY_ID.car.costPerHour, 430);
assert.equal(VEHICLE_BY_ID.car.savingsPercent, 12.5);
assert.equal(VEHICLE_BY_ID.van.costPerHour, 640);
assert.equal(VEHICLE_BY_ID.van.savingsPercent, 15);
assert.equal(VEHICLE_BY_ID.truck.costPerHour, 2180);
assert.equal(VEHICLE_BY_ID.truck.savingsPercent, 18);
assert.equal(VEHICLE_BY_ID.construction.costPerHour, 1615);
assert.equal(VEHICLE_BY_ID.construction.savingsPercent, 24);
assert.equal(VEHICLE_BY_ID.agro.costPerHour, 3030);
assert.equal(VEHICLE_BY_ID.agro.savingsPercent, 22);

assert.equal(HOURS_PER_DAY_MIN, 4);
assert.equal(HOURS_PER_DAY_MAX, 24);
assert.equal(DAYS_PER_MONTH_MIN, 1);
assert.equal(DAYS_PER_MONTH_MAX, 30);

// Приклад з таблиці: вантажівки, 3 од., 8 год/добу, 15 днів → 141264
const sample = monthlyFuelSavings({
  type: "truck",
  count: 3,
  hoursPerDay: 8,
  daysPerMonth: 15,
});
assert.equal(sample.ratePercent, 18);
assert.equal(sample.costPerHour, 2180);
assert.equal(sample.savings, 141264);

// Легкові: 430 * 12.5/100 * 1 * 8 * 20 = 8600
assert.equal(
  monthlyFuelSavings({ type: "car", count: 1, hoursPerDay: 8, daysPerMonth: 20 }).savings,
  8600,
);

console.log("fuel savings checks passed");
