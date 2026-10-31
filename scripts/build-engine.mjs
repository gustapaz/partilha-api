import { spawnSync } from "node:child_process";
import { mkdirSync } from "node:fs";
const zig = (args) => {
  const command = process.env.ZIG_BIN ?? "python";
  const prefix = process.env.ZIG_BIN ? [] : ["-m", "ziglang"];
  const r = spawnSync(command, [...prefix, ...args], { stdio: "inherit" });
  if (r.error) throw r.error;
  if (r.status !== 0) process.exit(r.status ?? 1);
};
mkdirSync("engine/pkg", { recursive: true });
zig([
  "cc",
  "engine/allocation.c",
  "-target",
  "wasm32-freestanding",
  "-nostdlib",
  "-O2",
  "-Wl,--no-entry",
  "-Wl,--export-memory",
  "-Wl,--export=weights_ptr",
  "-Wl,--export=result_ptr",
  "-Wl,--export=allocate",
  "-o",
  "engine/pkg/allocation.wasm",
]);
const native =
  "engine/pkg/native-test" + (process.platform === "win32" ? ".exe" : "");
zig(["cc", "engine/allocation.c", "-DNATIVE_TEST", "-O2", "-o", native]);
const result = spawnSync(
  process.platform === "win32" ? native : "./" + native,
  [],
  { stdio: "inherit" },
);
if (result.error) throw result.error;
if (result.status !== 0)
  throw new Error("Native C checks failed: " + result.status);
console.log("C engine compiled to WASM; native C checks passed.");
