import path from "path";
import fs from "fs";

export function buildFFmpegJob({ input, outputDir, preset }) {
  if (!input) throw new Error("Missing input");
  if (!outputDir) throw new Error("Missing outputDir");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const output = path.join(outputDir, `variant_p${preset.id}.mp4`);
  const built = preset.build();

  if (!built || !built.mode) {
    throw new Error(`Preset ${preset.id} missing mode`);
  }

  return {
    input,
    output,
    args: built.args ?? [],
    filters: built.mode === "simple" ? built.filters : null,
    complexFilters: built.mode === "complex" ? built.complexFilters : null,
    mode: built.mode,
  };
}
