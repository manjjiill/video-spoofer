import { app } from "electron";
import path from "path";

/* =========================
   LUT PATH (Filter Safe)
========================= */
export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", "contrast", fileName)
    : path.join(app.getAppPath(), "src", "luts", "contrast", fileName);

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
    ? path.join(process.resourcesPath, "assets", "gradient-2.png")
    : path.join(app.getAppPath(), "src", "assets", "gradient-2.png");

  return path.resolve(fullPath);
};

const getRandomRotation = () => {
  const angles = [
    (-15 * Math.PI) / 180,
    (15 * Math.PI) / 180,
    (-10 * Math.PI) / 180,
    (10 * Math.PI) / 180,
  ];

  return angles[Math.floor(Math.random() * angles.length)];
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
];

const SHUFFLED_LUTS = [...LUT_FILES].sort(() => Math.random() - 0.5);

export const generatePresetsSet6 = (startId) => {
  return Array.from({ length: LUT_FILES.length }).map((_, i) => {
    const uniqueId = startId + i;
    const lutName = SHUFFLED_LUTS[i % SHUFFLED_LUTS.length];

    return {
      id: uniqueId,

      build: () => {
        const lutPath = getLutPath(lutName);
        const gradientPath = getGradientPath();
        const randomAngle = getRandomRotation();

        return {
          mode: "complex",
          maskPath: gradientPath,

          complexFilters: [
            /* ========================= SMART NORMALIZATION ========================= */

            {
              filter: "eq",
              options: {
                brightness: 0.045,
                contrast: 1.015,
                saturation: 1.05,
              },
              inputs: "0:v",
              outputs: "base_pre",
            },

            // Gentle shadow protection curve
            {
              filter: "curves",
              options: {
                r: "0/0 0.25/0.28 1/1",
                g: "0/0 0.25/0.28 1/1",
                b: "0/0 0.25/0.28 1/1",
              },
              inputs: "base_pre",
              outputs: "base_safe",
            },

            {
              filter: "scale",
              options: { w: 1080, h: -1 },
              inputs: "base_safe",
              outputs: "fg_scaled",
            },

            {
              filter: "split",
              inputs: "fg_scaled",
              outputs: ["fg_original", "fg_lut_input"],
            },

            /* ========================= CONTROLLED LUT ========================= */
            {
              filter: "lut3d",
              options: {
                file: lutPath,
                interp: "tetrahedral",
              },
              inputs: "fg_lut_input",
              outputs: "fg_lut",
            },

            // Balanced intensity (safe for all clips)
            {
              filter: "blend",
              options: {
                all_mode: "overlay",
                all_opacity: 0.65,
              },
              inputs: ["fg_original", "fg_lut"],
              outputs: "fg_color",
            },

            // Slight soften after LUT
            {
              filter: "eq",
              options: {
                contrast: 0.98,
                saturation: 0.97,
              },
              inputs: "fg_color",
              outputs: "fg_final",
            },

            /* ========================= ROTATION ========================= */
            {
              filter: "format",
              options: { pix_fmts: "rgba" },
              inputs: "fg_final",
              outputs: "fg_rgba",
            },

            {
              filter: "rotate",
              options: {
                angle: randomAngle,
                fillcolor: "none",
                ow: "rotw(iw)",
                oh: "roth(ih)",
              },
              inputs: "fg_rgba",
              outputs: "fg_rotated",
            },

            /* ========================= BACKGROUND ========================= */

            {
              filter: "scale",
              options: { w: 1080, h: 1920 },
              inputs: "1:v",
              outputs: "bg_scaled",
            },

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
