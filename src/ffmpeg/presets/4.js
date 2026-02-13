import { app } from "electron";
import path from "path";

/* =========================
   LUT PATH
========================= */
export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", "rounded", fileName)
    : path.join(app.getAppPath(), "src", "luts", "rounded", fileName);

  let normalized = path.resolve(fullPath).replace(/\\/g, "/");

  if (process.platform === "win32") {
    normalized = normalized.replace(/:/g, "\\:");
  }

  // Required for lut3d inside filter_complex
  return `'${normalized}'`;
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

const getRandomRotation = () => {
  const min = 3;
  const max = 8;

  const deg = Math.random() * (max - min) + min;
  const sign = Math.random() < 0.5 ? -1 : 1;

  return (deg * sign * Math.PI) / 180;
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

export const generatePresetsSet4 = (startId) => {
  return Array.from({ length: LUT_FILES.length }).map((_, i) => {
    const uniqueId = startId + i;

    const randomAngle = getRandomRotation();

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

            // Gentle shadow protection
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
              options: { w: 1000, h: 1850 },
              inputs: "base_safe",
              outputs: "fg_scaled",
            },

            {
              filter: "split",
              inputs: "fg_scaled",
              outputs: ["fg_base", "fg_lut_input"],
            },

            /* ========================= CONTROLLED LUT ========================= */

            {
              filter: "lut3d",
              options: {
                file: rawLutPath,
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

            // Slight soften after LUT
            {
              filter: "eq",
              options: {
                contrast: 0.98,
                saturation: 0.97,
              },
              inputs: "fg_color",
              outputs: "fg_final_color",
            },

            /* ========================= MASKING & ROTATION ========================= */

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
              filter: "format",
              options: { pix_fmts: "rgba" },
              inputs: "fg_rounded",
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

            /* ========================= FINAL COMPOSITION ========================= */

            {
              filter: "color",
              options: { color: "black", size: "1080x1920" },
              outputs: "bg",
            },

            {
              filter: "overlay",
              options: {
                x: "(W-w)/2",
                y: "(H-h)/2",
                shortest: 1,
              },
              inputs: ["bg", "fg_rotated"],
              outputs: "outv",
            },
          ],
        };
      },
    };
  });
};
