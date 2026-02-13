import { app } from "electron";
import path from "path";

/* =========================
   LUT PATH
========================= */
export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", "fairytale", fileName)
    : path.join(app.getAppPath(), "src", "luts", "fairytale", fileName);

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

export const generatePresetsSet1 = (startId) => {
  return Array.from({ length: LUT_FILES.length }).map((_, i) => {
    const uniqueId = startId + i;

    return {
      id: uniqueId,
      build: () => {
        const lutName = SHUFFLED_LUTS[i % SHUFFLED_LUTS.length];
        const lutPath = getLutPath(lutName);

        const randomAngle = (Math.random() * 30 - 15).toFixed(2);
        const randomScale = (Math.random() * 0.2 + 0.8).toFixed(2);

        console.log(lutPath);

        return {
          mode: "complex",
          complexFilters: [
            // Lift shadows gently (important)
            {
              filter: "eq",
              options: {
                brightness: 0.04,
                contrast: 1.015,
                saturation: 1.05,
              },
              inputs: "0:v",
              outputs: "base_pre",
            },

            // Gentle shadow + highlight protection
            {
              filter: "curves",
              options: {
                r: "0/0 0.25/0.28 0.75/0.72 1/1",
                g: "0/0 0.25/0.28 0.75/0.72 1/1",
                b: "0/0 0.25/0.28 0.75/0.72 1/1",
              },
              inputs: "base_pre",
              outputs: "base_lift",
            },

            // Split for blend-based LUT
            {
              filter: "split",
              inputs: "base_lift",
              outputs: ["original", "lut_input"],
            },

            // Apply LUT
            {
              filter: "lut3d",
              options: {
                file: lutPath,
                interp: "tetrahedral",
              },
              inputs: "lut_input",
              outputs: "lut_applied",
            },

            // Blend at 55% intensity
            {
              filter: "blend",
              options: {
                all_mode: "overlay",
                all_opacity: 0.6,
              },
              inputs: ["original", "lut_applied"],
              outputs: "colored",
            },

            // Slight soften after LUT
            {
              filter: "eq",
              options: {
                contrast: 0.98,
                saturation: 0.97,
              },
              inputs: "colored",
              outputs: "final_color",
            },

            // Transforms
            {
              filter: "hflip",
              inputs: "final_color",
              outputs: "flipped",
            },
            {
              filter: "scale",
              options: {
                w: `iw*${randomScale}`,
                h: `ih*${randomScale}`,
                flags: "lanczos",
              },
              inputs: "flipped",
              outputs: "scaled",
            },
            {
              filter: "rotate",
              options: {
                angle: `${randomAngle}*PI/180`,
                fillcolor: "black",
              },
              inputs: "scaled",
              outputs: "rotated",
            },

            // Final resolution
            {
              filter: "scale",
              options: {
                w: 1080,
                h: 1920,
                flags: "lanczos",
                force_original_aspect_ratio: "decrease",
              },
              inputs: "rotated",
              outputs: "resized",
            },
            {
              filter: "pad",
              options: {
                w: 1080,
                h: 1920,
                x: "(ow-iw)/2",
                y: "(oh-ih)/2",
                color: "black",
              },
              inputs: "resized",
              outputs: "outv",
            },
          ],
        };
      },
    };
  });
};
