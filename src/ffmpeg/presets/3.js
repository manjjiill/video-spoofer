import { app } from "electron";
import path from "path";

/* =========================
   LUT PATH
========================= */
export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", "crop", fileName)
    : path.join(app.getAppPath(), "src", "luts", "crop", fileName);

  let normalized = path.resolve(fullPath).replace(/\\/g, "/");

  if (process.platform === "win32") {
    normalized = normalized.replace(/:/g, "\\:");
  }

  // Required for lut3d inside filter_complex
  return `'${normalized}'`;
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

export const generatePresetsSet3 = (startId) => {
  return Array.from({ length: LUT_FILES.length }).map((_, i) => {
    const uniqueId = startId + i;

    return {
      id: uniqueId,
      build: () => {
        const lutName = SHUFFLED_LUTS[i % SHUFFLED_LUTS.length];
        const rawLutPath = getLutPath(lutName);

        // 🎯 Random rotation 2°–5° (positive or negative)
        const rotationDeg = Math.random() * 3 + 2; // 2 → 5
        const rotationSign = Math.random() < 0.5 ? -1 : 1;
        const randomAngle = (rotationDeg * rotationSign * Math.PI) / 180;

        // 🎯 Random crop 14%–20%
        const cropPercent = Math.random() * (0.2 - 0.14) + 0.14;

        return {
          mode: "complex",
          complexFilters: [
            /* ================= SCALE TO FILL VERTICAL ================= */

            {
              filter: "scale",
              options: {
                w: 1080,
                h: 1920,
                force_original_aspect_ratio: "increase",
              },
              inputs: "0:v",
              outputs: "scaled",
            },

            /* ================= RANDOM TOP/BOTTOM CROP ================= */

            {
              filter: "crop",
              options: {
                w: 1080,
                h: `1920*(1-${cropPercent})`,
                x: "(iw-1080)/2",
                y: `(ih - 1920*(1-${cropPercent}))/2`,
              },
              inputs: "scaled",
              outputs: "cropped",
            },

            /* ================= PAD BACK TO 1080x1920 ================= */

            {
              filter: "pad",
              options: {
                w: 1080,
                h: 1920,
                x: 0,
                y: "(oh-ih)/2",
                color: "black",
              },
              inputs: "cropped",
              outputs: "padded",
            },

            /* ================= RANDOM ROTATION ================= */

            {
              filter: "rotate",
              options: {
                angle: randomAngle,
                fillcolor: "black",
                ow: "rotw(iw)",
                oh: "roth(ih)",
              },
              inputs: "padded",
              outputs: "rotated",
            },

            /* ================= SLIGHT ZOOM TO HIDE CORNERS ================= */

            {
              filter: "scale",
              options: {
                w: "iw*1.02",
                h: "ih*1.02",
              },
              inputs: "rotated",
              outputs: "zoomed",
            },

            {
              filter: "crop",
              options: {
                w: 1080,
                h: 1920,
                x: "(iw-1080)/2",
                y: "(ih-1920)/2",
              },
              inputs: "zoomed",
              outputs: "final_base",
            },

            /* ================= SMART LUT ENGINE ================= */

            // Gentle exposure lift
            {
              filter: "eq",
              options: {
                brightness: 0.045,
                contrast: 1.015,
                saturation: 1.04,
              },
              inputs: "final_base",
              outputs: "base_pre",
            },

            // Shadow + highlight protection
            {
              filter: "curves",
              options: {
                r: "0/0 0.25/0.28 0.75/0.72 1/1",
                g: "0/0 0.25/0.28 0.75/0.72 1/1",
                b: "0/0 0.25/0.28 0.75/0.72 1/1",
              },
              inputs: "base_pre",
              outputs: "base_safe",
            },

            // Split
            {
              filter: "split",
              inputs: "base_safe",
              outputs: ["base", "to_lut"],
            },

            // Apply LUT
            {
              filter: "lut3d",
              options: {
                file: rawLutPath,
                interp: "tetrahedral",
              },
              inputs: "to_lut",
              outputs: "lut_applied",
            },

            // Controlled blend (safe for all clips)
            {
              filter: "blend",
              options: {
                all_mode: "overlay",
                all_opacity: 0.58,
              },
              inputs: ["base", "lut_applied"],
              outputs: "blended",
            },

            // Cinematic finish
            {
              filter: "eq",
              options: {
                contrast: 0.97,
                saturation: 0.94,
                gamma: 1.02,
              },
              inputs: "blended",
              outputs: "outv",
            },
          ],
        };
      },
    };
  });
};
