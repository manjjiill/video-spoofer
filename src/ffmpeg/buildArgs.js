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

  const videoFolder = path.join(outputDir, baseName);

  if (!fs.existsSync(videoFolder)) {
    fs.mkdirSync(videoFolder, { recursive: true });
  }

  const outputFileName = `${baseName}_v${preset.id}${ext}`;
  const output = path.join(videoFolder, outputFileName);

  const built = preset.build();

  if (!built || !built.mode) {
    throw new Error(`Preset ${preset.id} missing mode`);
  }

  let extraInputs = [];

  if (built.maskPath) {
    extraInputs.push(built.maskPath);
  }

  if (built.bgInput) {
    extraInputs.push(built.bgInput);
  }

  if (built.extraInputs && Array.isArray(built.extraInputs)) {
    extraInputs = [...extraInputs, ...built.extraInputs];
  }

  return {
    input,
    output,
    extraInputs,
    args: built.args ?? [],
    filters: built.mode === "simple" ? built.filters : null,
    complexFilters: built.mode === "complex" ? built.complexFilters : null,
    mode: built.mode,
  };
}
