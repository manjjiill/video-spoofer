import { app } from "electron";
import path from "path";

/* =========================
   LUT PATH (Filter Safe)
========================= */
export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", "vivid", fileName)
    : path.join(app.getAppPath(), "src", "luts", "vivid", fileName);

  let normalized = path.resolve(fullPath).replace(/\\/g, "/");

  if (process.platform === "win32") {
    normalized = normalized.replace(/:/g, "\\:");
  }

  // Required for lut3d inside filter_complex
  return `'${normalized}'`;
};

/* =========================
   GRADIENT PATH
========================= */
const getGradientPath = () => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "assets", "gradient.png")
    : path.join(app.getAppPath(), "src", "assets", "gradient.png");

  return path.resolve(fullPath);
};

const LUT_FILES = [
  "1.cube",
  "2.cube",
  "3.cube",
  "4.cube",
  "5.cube",
  "6.cube",
  "7.cube",
  "8.cube",
  "9.cube",
  "10.cube",
  "11.cube",
  "12.cube",
  "13.cube",
  "14.cube",
  "15.cube",
];

const SHUFFLED_LUTS = [...LUT_FILES].sort(() => Math.random() - 0.5);

/* =========================
   SET 5 – Gradient + LUT + 15° Rotate
========================= */
export const generatePresetsSet5 = (startId) => {
  return Array.from({ length: LUT_FILES.length }).map((_, i) => {
    const uniqueId = startId + i;
    const lutName = SHUFFLED_LUTS[i % SHUFFLED_LUTS.length];

    return {
      id: uniqueId,

      build: () => {
        const lutPath = getLutPath(lutName);
        const gradientPath = getGradientPath();

        return {
          mode: "complex",

          // Gradient becomes second input (index 1)
          maskPath: gradientPath,

          complexFilters: [
            /* =========================
               STAGE 1 – FOREGROUND SCALE
               (Fill width, maintain aspect ratio)
            ========================= */
            {
              filter: "scale",
              options: { w: 1080, h: -1 },
              inputs: "0:v",
              outputs: "fg_scaled",
            },

            {
              filter: "eq",
              options: {
                contrast: 1.05,
                brightness: 0.02,
                saturation: 1.1,
              },
              inputs: "fg_scaled",
              outputs: "fg_norm",
            },

            {
              filter: "split",
              inputs: "fg_norm",
              outputs: ["fg_base", "fg_lut_input"],
            },

            /* =========================
               STAGE 2 – LUT
            ========================= */
            {
              filter: "lut3d",
              options: {
                file: lutPath,
                interp: "tetrahedral",
              },
              inputs: "fg_lut_input",
              outputs: "fg_lut",
            },

            {
              filter: "blend",
              options: {
                all_mode: "overlay",
                all_opacity: 0.6,
              },
              inputs: ["fg_base", "fg_lut"],
              outputs: "fg_color",
            },

            /* =========================
               STAGE 3 – RGBA + SAFE ROTATION
            ========================= */
            {
              filter: "format",
              options: { pix_fmts: "rgba" },
              inputs: "fg_color",
              outputs: "fg_rgba",
            },

            {
              filter: "rotate",
              options: {
                angle: 0.261799, // 15 degrees
                fillcolor: "none",
                ow: "rotw(iw)",
                oh: "roth(ih)",
              },
              inputs: "fg_rgba",
              outputs: "fg_rotated",
            },

            /* =========================
               STAGE 4 – BACKGROUND
            ========================= */
            {
              filter: "scale",
              options: { w: 1080, h: 1920 },
              inputs: "1:v",
              outputs: "bg_scaled",
            },

            /* =========================
               FINAL COMPOSITION
            ========================= */
            {
              filter: "overlay",
              options: {
                x: "(W-w)/2",
                y: "(H-h)/2",
              },
              inputs: ["bg_scaled", "fg_rotated"],
              outputs: "outv",
            },
          ],
        };
      },
    };
  });
};
