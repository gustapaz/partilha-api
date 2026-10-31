import { meta } from "./meta.mjs";
import { validate } from "./core.mjs";
const input = {
  type: "object",
  additionalProperties: false,
  required: ["units", "participants"],
  properties: {
    units: { type: "integer", minimum: 0, maximum: 10000 },
    method: {
      type: "string",
      enum: ["largest_remainder", "highest_averages"],
      default: "largest_remainder",
    },
    participants: {
      type: "array",
      minItems: 1,
      maxItems: 50,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["id", "weight"],
        properties: {
          id: { type: "string", pattern: "^[a-z][a-z0-9_-]{0,31}$" },
          weight: { type: "integer", minimum: 1, maximum: 1000000 },
        },
      },
    },
  },
};
const allocation = {
  type: "object",
  required: [
    "id",
    "weight",
    "units",
    "quota_numerator",
    "quota_denominator",
    "lower_quota",
    "remainder_numerator",
  ],
  properties: {
    id: { type: "string" },
    ...Object.fromEntries(
      [
        "weight",
        "units",
        "quota_numerator",
        "quota_denominator",
        "lower_quota",
        "remainder_numerator",
      ].map((k) => [k, { type: "integer", minimum: 0 }]),
    ),
  },
};
const output = {
  type: "object",
  required: [
    "engine",
    "method",
    "total_units",
    "total_weight",
    "assigned",
    "allocations",
    "tie_break",
  ],
  properties: {
    engine: { type: "string" },
    method: { type: "string" },
    total_units: { type: "integer" },
    total_weight: { type: "integer" },
    assigned: { type: "integer" },
    allocations: { type: "array", items: allocation },
    tie_break: { type: "string" },
  },
};
export function createService(allocate) {
  return {
    meta,
    health: () => allocate(meta.examples[0].input).assigned === 3,
    actions: {
      [meta.primary]: {
        label: "Distribuir unidades indivisíveis",
        description: meta.behavior,
        input,
        output,
        run: allocate,
      },
      [meta.secondary]: {
        label: "Comparar os dois métodos",
        description:
          "Valida method, se enviado, mas calcula ambos para a mesma entrada.",
        input,
        output: {
          type: "object",
          required: [
            "largest_remainder",
            "highest_averages",
            "different",
            "l1_distance",
          ],
          properties: {
            largest_remainder: output,
            highest_averages: output,
            different: { type: "boolean" },
            l1_distance: { type: "integer" },
          },
        },
        run: (input) => {
          validate(input);
          const largest_remainder = allocate({
              ...input,
              method: "largest_remainder",
            }),
            highest_averages = allocate({
              ...input,
              method: "highest_averages",
            });
          const l1_distance = largest_remainder.allocations.reduce(
            (sum, a, i) =>
              sum + Math.abs(a.units - highest_averages.allocations[i].units),
            0,
          );
          return {
            largest_remainder,
            highest_averages,
            different: l1_distance !== 0,
            l1_distance,
          };
        },
      },
    },
  };
}
