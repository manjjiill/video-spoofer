import { app } from "electron";
import path from "path";

export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", fileName)
    : path.join(app.getAppPath(), "src", "luts", fileName);

  let normalizedPath = path.resolve(fullPath).split(path.sep).join("/");

  if (process.platform === "win32") {
    normalizedPath = normalizedPath.replace(/:/g, "\\:");
    return `'${normalizedPath}'`;
  }

  return normalizedPath;
};

const getMaskPath = () => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "assets", "border-radius.png")
    : path.join(app.getAppPath(), "src", "assets", "border-radius.png");

  let normalized = path.resolve(fullPath).replace(/\\/g, "/");

  if (process.platform === "win32") {
    normalized = normalized.replace(/:/g, "\\:");
    return `'${normalized}'`;
  }

  return normalized;
};

const LUT_FILES = [
  "40.cube",
  "41.cube",
  "42.cube",
  "43.cube",
  "44.cube",
  "45.cube",
  "46.cube",
  "47.cube",
  "48.cube",
  "49.cube",
  "50.cube",
  "51.cube",
  "52.cube",
  "53.cube",
  "54.cube",
  "55.cube",
  "56.cube",
  "57.cube",
  "58.cube",
  "59.cube",
  "60.cube",
];

const SHUFFLED_LUTS = [...LUT_FILES].sort(() => Math.random() - 0.5);

export const generatePresetsSet4 = (startId) => {
  return Array.from({ length: LUT_FILES.length - 1 }).map((_, i) => {
    const uniqueId = startId + i;

    const randomAngle = ((3 + Math.random()) * Math.PI) / 180;

    return {
      id: uniqueId,
      build: () => {
        const lutName = SHUFFLED_LUTS[i % SHUFFLED_LUTS.length];
        const rawLutPath = getLutPath(lutName);
        const maskPath = getMaskPath();

        return {
          mode: "complex",
          maskPath: maskPath,

          complexFilters: [
            // --- STAGE 1: FG PRE-PROCESSING (950x1750) ---
            {
              filter: "scale",
              options: { w: 1000, h: 1850 },
              inputs: "0:v",
              outputs: "fg_scaled",
            },
            {
              filter: "normalize",
              options: { smoothing: 5 },
              inputs: "fg_scaled",
              outputs: "fg_normed",
            },
            {
              filter: "split",
              inputs: "fg_normed",
              outputs: ["fg_base", "fg_to_lut"],
            },
            {
              filter: "lut3d",
              options: { file: rawLutPath, interp: "tetrahedral" }, // Faster & Better
              inputs: "fg_to_lut",
              outputs: "fg_lut_applied",
            },
            {
              filter: "blend",
              options: { all_expr: "A*0.55 + B*0.45" },
              inputs: ["fg_base", "fg_lut_applied"],
              outputs: "fg_final_color",
            },

            // --- STAGE 2: MASKING & ROTATION ---
            {
              filter: "scale",
              options: { w: 1000, h: 1850 },
              inputs: "1:v",
              outputs: "mask_scaled",
            },
            {
              filter: "alphamerge",
              inputs: ["fg_final_color", "mask_scaled"],
              outputs: "fg_rounded",
            },
            {
              filter: "rotate",
              options: { angle: randomAngle, fillcolor: "none" }, // Use 'none' for alpha transparency
              inputs: "fg_rounded",
              outputs: "fg_rotated",
            },

            // --- STAGE 3: FINAL COMPOSITION (1080x1920) ---
            {
              filter: "color",
              options: { color: "black", size: "1080x1920" },
              outputs: "bg",
            },
            {
              filter: "overlay",
              options: { x: "(W-w)/2", y: "(H-h)/2", shortest: 1 },
              inputs: ["bg", "fg_rotated"],
              outputs: "outv",
            },
          ],
        };
      },
    };
  });
};
