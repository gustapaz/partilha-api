const participants = [
  { id: "a", weight: 5 },
  { id: "b", weight: 3 },
  { id: "c", weight: 2 },
];
export const meta = {
  repo: "partilha-api",
  title: "Partilha API",
  engine: "c-wasm",
  accent: "#754314",
  headline: "Recursos inteiros. Critérios explícitos.",
  description:
    "Distribua unidades indivisíveis proporcionalmente, usando maiores restos ou maiores médias. Cálculos inteiros em C, compilados para WebAssembly e executados no servidor.",
  behavior:
    "Compara Hamilton (maiores restos) e D’Hondt (maiores médias). A soma distribuída é sempre exata. Quocientes são comparados por multiplicação cruzada, sem ponto flutuante. IDs ASCII resolvem empates.",
  limits:
    "Até 50 participantes, pesos inteiros de 1 a 1.000.000, 0 a 10.000 unidades e 32 KiB por JSON. Os métodos podem dar resultados distintos e não representam uma regra universal de justiça.",
  primary: "/api/v1/allocate",
  secondary: "/api/v1/compare",
  primaryLabel: "Distribuir unidades →",
  secondaryLabel: "Comparar métodos",
  examples: [
    {
      name: "Três unidades",
      input: { units: 3, participants },
      expected: {
        assigned: 3,
        "allocations.0.units": 1,
        "allocations.2.units": 1,
      },
    },
    {
      name: "Maiores médias",
      input: { units: 3, participants, method: "highest_averages" },
      expected: {
        assigned: 3,
        "allocations.0.units": 2,
        "allocations.2.units": 0,
      },
    },
    {
      name: "Empate",
      input: {
        units: 2,
        participants: [
          { id: "beta", weight: 1 },
          { id: "alfa", weight: 1 },
          { id: "gama", weight: 1 },
        ],
      },
      expected: {
        "allocations.0.id": "alfa",
        "allocations.0.units": 1,
        "allocations.2.units": 0,
      },
    },
  ],
  secondaryExpected: { different: true, l1_distance: 2 },
};
