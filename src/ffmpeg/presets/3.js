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

export const generatePresetsSet3 = (startId) => {
  return Array.from({ length: LUT_FILES.length - 1 }).map((_, i) => {
    const uniqueId = startId + i;

    const randomAngle = ((0.5 + Math.random() * 0.5) * Math.PI) / 180;

    return {
      id: uniqueId,
      build: () => {
        const lutName = SHUFFLED_LUTS[i % SHUFFLED_LUTS.length];
        const rawLutPath = getLutPath(lutName);

        // Micro invisible rotation (-0.5° to +0.5°)
        const randomAngle = (Math.random() * 1 - 0.5).toFixed(4);

        console.log(`[Preset Vertical ${i + 1}] Rotate: ${randomAngle}`);

        return {
          mode: "complex",
          complexFilters: [
            // ---------------- SCALE TO FILL VERTICAL ----------------
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

            // ---------------- REAL TOP/BOTTOM CROP (10%) ----------------
            {
              filter: "crop",
              options: {
                w: 1080,
                h: "1920*0.85",
                x: "(iw-1080)/2",
                y: "(ih - 1920*0.85)/2",
              },
              inputs: "scaled",
              outputs: "cropped",
            },

            // ---------------- PAD BACK TO 1080x1920 ----------------
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

            // ---------------- MICRO ROTATION ----------------
            {
              filter: "rotate",
              options: {
                a: `${randomAngle}*PI/180`,
                fillcolor: "black",
              },
              inputs: "padded",
              outputs: "rotated",
            },

            // ---------------- ZOOM TO HIDE CORNERS ----------------
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

            // ================= COLOR PIPELINE =================

            {
              filter: "normalize",
              options: {
                blackpt: "black",
                whitept: "white",
                smoothing: 5,
              },
              inputs: "final_base",
              outputs: "norm",
            },

            {
              filter: "eq",
              options: {
                contrast: 1.03,
                brightness: 0.01,
                saturation: 1.02,
              },
              inputs: "norm",
              outputs: "pre_lut",
            },

            {
              filter: "split",
              inputs: "pre_lut",
              outputs: ["base", "to_lut"],
            },

            {
              filter: "lut3d",
              options: {
                file: rawLutPath,
                interp: "tetrahedral",
              },
              inputs: "to_lut",
              outputs: "lut_applied",
            },

            {
              filter: "blend",
              options: {
                all_expr: "A*0.55 + B*0.45",
              },
              inputs: ["base", "lut_applied"],
              outputs: "blended",
            },

            {
              filter: "eq",
              options: {
                contrast: 0.97,
                saturation: 0.93,
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
