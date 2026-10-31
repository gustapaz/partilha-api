import { exact, invalid } from "./http.mjs";
export function validate(input) {
  exact(input, ["units", "participants", "method"], "requisição");
  if (!Number.isInteger(input.units) || input.units < 0 || input.units > 10000)
    invalid("invalid_units", "units deve ser inteiro entre 0 e 10000.");
  if (
    !Array.isArray(input.participants) ||
    input.participants.length < 1 ||
    input.participants.length > 50
  )
    invalid("invalid_participants", "Defina entre 1 e 50 participantes.");
  const ids = new Set();
  const participants = input.participants
    .map((p) => {
      exact(p, ["id", "weight"], "participante");
      if (
        typeof p.id !== "string" ||
        !/^[a-z][a-z0-9_-]{0,31}$/.test(p.id) ||
        ids.has(p.id)
      )
        invalid("invalid_id", "IDs ASCII minúsculos devem ser únicos.");
      ids.add(p.id);
      if (!Number.isInteger(p.weight) || p.weight < 1 || p.weight > 1000000)
        invalid("invalid_weight", "weight deve ser inteiro entre 1 e 1000000.");
      return { ...p };
    })
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  const method = input.method ?? "largest_remainder";
  if (!["largest_remainder", "highest_averages"].includes(method))
    invalid("invalid_method", "Método desconhecido.");
  return { units: input.units, participants, method };
}
export function createAllocator(module) {
  return (input) => {
    const { units, participants, method } = validate(input),
      e = new WebAssembly.Instance(module, {}).exports,
      n = participants.length;
    new Uint32Array(e.memory.buffer, e.weights_ptr(), n).set(
      participants.map((p) => p.weight),
    );
    if (e.allocate(n, units, method === "largest_remainder" ? 0 : 1) !== 0)
      throw new Error("C rejected trusted ABI input");
    const counts = Array.from(
        new Uint32Array(e.memory.buffer, e.result_ptr(), n),
      ),
      total = participants.reduce((sum, p) => sum + p.weight, 0);
    return {
      engine: "c-wasm",
      method,
      total_units: units,
      total_weight: total,
      assigned: counts.reduce((a, b) => a + b, 0),
      allocations: participants.map((p, i) => ({
        ...p,
        units: counts[i],
        quota_numerator: units * p.weight,
        quota_denominator: total,
        lower_quota: Math.floor((units * p.weight) / total),
        remainder_numerator: (units * p.weight) % total,
      })),
      tie_break:
        "Ascending ASCII participant ID. Exact integer quotient comparisons.",
    };
  };
}
