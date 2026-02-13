import { app } from "electron";
import path from "path";

/* ========================= LUT PATH ========================= */
export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", "blur", fileName)
    : path.join(app.getAppPath(), "src", "luts", "blur", fileName);

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

export const generatePresetsSet2 = (startId) => {
  return LUT_FILES.map((_, i) => {
    const uniqueId = startId + i;

    return {
      id: uniqueId,
      build: () => {
        const lutName = SHUFFLED_LUTS[i % SHUFFLED_LUTS.length];
        const rawLutPath = getLutPath(lutName);

        const bgZoom = 1.225;
        const cropAmount = 0.165; 

        return {
          mode: "complex",
          complexFilters: [
            /* ========================= BACKGROUND ========================= */
            {
              filter: "scale",
              options: { w: `iw*${bgZoom}`, h: -2, flags: "lanczos" },
              inputs: "0:v",
              outputs: "bg_zoom",
            },
            {
              filter: "scale",
              options: { w: 1080, h: 1920, flags: "lanczos" },
              inputs: "bg_zoom",
              outputs: "bg_scaled",
            },
            {
              filter: "gblur",
              options: { sigma: 30 },
              inputs: "bg_scaled",
              outputs: "bg_blur",
            },

            /* ========================= FOREGROUND (CROP TOP/BOTTOM) ========================= */
            {
              filter: "crop",
              options: {
                w: "iw",
                h: `ih*(1-${cropAmount})`,
                x: 0,
                y: "(ih-oh)/2",
              },
              inputs: "0:v",
              outputs: "fg_crop",
            },
            {
              filter: "scale",
              options: { w: 1080, h: -2, flags: "lanczos" },
              inputs: "fg_crop",
              outputs: "fg_scaled",
            },

            /* ========================= MERGE FG ON BLURRED BG ========================= */
            {
              filter: "overlay",
              options: {
                x: "(W-w)/2",
                y: "(H-h)/2",
              },
              inputs: ["bg_blur", "fg_scaled"],
              outputs: "merged",
            },

            /* ========================= SMART LUT ENGINE ========================= */

            // Gentle exposure lift
            {
              filter: "eq",
              options: {
                brightness: 0.04,
                contrast: 1.015,
                saturation: 1.04,
              },
              inputs: "merged",
              outputs: "base_pre",
            },

            // Protect shadows & highlights
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

            // Split for blend LUT
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

            // Cinematic soften
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
