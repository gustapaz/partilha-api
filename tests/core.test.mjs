import { test } from "node:test";
import assert from "node:assert/strict";
import { allocate } from "../server/node-runtime.mjs";
const participants = [
  { id: "a", weight: 5 },
  { id: "b", weight: 3 },
  { id: "c", weight: 2 },
];
test("Hamilton vs highest averages known different allocation", () => {
  assert.deepEqual(
    allocate({ units: 3, participants }).allocations.map((a) => a.units),
    [1, 1, 1],
  );
  assert.deepEqual(
    allocate({
      units: 3,
      participants,
      method: "highest_averages",
    }).allocations.map((a) => a.units),
    [2, 1, 0],
  );
});
test("ID tie breaking and permutation invariance", () => {
  const a = {
    units: 2,
    participants: [
      { id: "z", weight: 1 },
      { id: "a", weight: 1 },
      { id: "b", weight: 1 },
    ],
  };
  const first = allocate(a);
  a.participants.reverse();
  assert.deepEqual(first, allocate(a));
  assert.deepEqual(
    first.allocations.map((a) => a.units),
    [1, 1, 0],
  );
});
test("zero units and single participant", () => {
  assert.equal(allocate({ units: 0, participants }).assigned, 0);
  assert.equal(
    allocate({ units: 10000, participants: [participants[0]] }).allocations[0]
      .units,
    10000,
  );
});
test("largest legal products exceed 32-bit without overflow", () => {
  const p = Array.from({ length: 50 }, (_, i) => ({
    id: "p" + i,
    weight: 1000000,
  }));
  for (const method of ["largest_remainder", "highest_averages"]) {
    const r = allocate({ units: 10000, participants: p, method });
    assert.ok(r.allocations.every((a) => a.units === 200));
    assert.equal(r.assigned, 10000);
    assert.equal(r.allocations[0].quota_numerator, 10000000000);
  }
});
test("500 seeded cases conserve units; Hamilton satisfies quota bounds", () => {
  let seed = 234;
  const rand = (n) => {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    return seed % n;
  };
  for (let round = 0; round < 500; round++) {
    const p = Array.from({ length: 1 + rand(15) }, (_, i) => ({
        id: "p" + i,
        weight: 1 + rand(10000),
      })),
      units = rand(300);
    for (const method of ["largest_remainder", "highest_averages"]) {
      const r = allocate({ units, participants: p, method });
      assert.equal(r.assigned, units);
      for (const a of r.allocations) {
        assert.ok(Number.isInteger(a.units) && a.units >= 0);
        if (method === "largest_remainder") {
          assert.ok(a.units >= a.lower_quota);
          assert.ok(
            a.units <= Math.ceil(a.quota_numerator / a.quota_denominator),
          );
        }
      }
    }
  }
});
test("scale invariance of weights", () => {
  for (const method of ["largest_remainder", "highest_averages"])
    assert.deepEqual(
      allocate({ units: 13, participants, method }).allocations.map(
        (a) => a.units,
      ),
      allocate({
        units: 13,
        participants: participants.map((p) => ({ ...p, weight: p.weight * 7 })),
        method,
      }).allocations.map((a) => a.units),
    );
});
for (const input of [
  null,
  [],
  {},
  { units: -1, participants },
  { units: 1.5, participants },
  { units: 10001, participants },
  { units: 3, participants: [] },
  { units: 3, participants: [{ id: "a", weight: 0 }] },
  { units: 3, participants: [{ id: "a", weight: 1000001 }] },
  {
    units: 3,
    participants: [
      { id: "a", weight: 1 },
      { id: "a", weight: 2 },
    ],
  },
  { units: 3, participants, method: "other" },
  { units: 3, participants, surprise: true },
])
  test("invalid " + JSON.stringify(input), () =>
    assert.throws(
      () => allocate(input),
      (e) => e.status === 422,
    ),
  );
