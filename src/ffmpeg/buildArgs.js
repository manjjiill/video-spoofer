import path from "path";
import fs from "fs";

export function buildFFmpegJob({ input, outputDir, preset }) {
  if (!input) throw new Error("Missing input");
  if (!outputDir) throw new Error("Missing outputDir");

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Extract original name & extension
  const parsed = path.parse(input);
  const baseName = parsed.name;
  const ext = parsed.ext || ".mp4";

  const outputFileName = `${baseName}_v${preset.id}${ext}`;
  const output = path.join(outputDir, outputFileName);
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
