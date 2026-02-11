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
  "20.cube",
  "21.cube",
  "22.cube",
  "23.cube",
  "24.cube",
  "25.cube",
  "26.cube",
  "27.cube",
  "28.cube",
  "29.cube",
  "30.cube",
  "31.cube",
  "32.cube",
  "33.cube",
  "34.cube",
  "35.cube",
  "36.cube",
  "37.cube",
  "38.cube",
  "39.cube",
  "40.cube",
];

const SHUFFLED_LUTS = [...LUT_FILES].sort(() => Math.random() - 0.5);

export const generatePresetsSet2 = (startId) => {
  return Array.from({ length: LUT_FILES.length - 1 }).map((_, i) => {
    const uniqueId = startId + i;

    return {
      id: uniqueId,
      build: () => {
        const lutName = SHUFFLED_LUTS[i % SHUFFLED_LUTS.length];
        const rawLutPath = getLutPath(lutName);

        const bgZoom = 1.15;
        const fgCropAmount = 0.15;

        const randomAngle = ((0.5 + Math.random() * 0.5) * Math.PI) / 180;

        console.log(`[Preset ${i + 1}]`);

        return {
          mode: "complex",
          complexFilters: [
            // ---------------- BACKGROUND ----------------
            {
              filter: "scale",
              options: { w: `iw*${bgZoom}`, h: -2, flags: "lanczos" },
              inputs: "0:v",
              outputs: "bg_z",
            },
            {
              filter: "scale",
              options: { w: 1080, h: 1920, flags: "lanczos" },
              inputs: "bg_z",
              outputs: "bg_f",
            },
            {
              filter: "gblur",
              options: { sigma: 25 },
              inputs: "bg_f",
              outputs: "bg_blur",
            },

            // ---------------- FOREGROUND ----------------
            {
              filter: "crop",
              options: {
                w: "iw",
                h: `ih*(1-${fgCropAmount})`,
                x: 0,
                y: "(ih-oh)/2",
              },
              inputs: "0:v",
              outputs: "fg_c",
            },
            {
              filter: "scale",
              options: { w: 1080, h: -2, flags: "lanczos" },
              inputs: "fg_c",
              outputs: "fg_s",
            },

            // ---------------- MERGE ----------------
            {
              filter: "overlay",
              options: { x: "(W-w)/2", y: "(H-h)/2" },
              inputs: ["bg_blur", "fg_s"],
              outputs: "merged",
            },

            // ---------------- SLIGHT ROTATION ----------------
            {
              filter: "rotate",
              options: {
                angle: randomAngle,
                fillcolor: "black",
                ow: "ceil(rotw(iw)/2)*2",
                oh: "ceil(roth(ih)/2)*2",
              },
              inputs: "merged",
              outputs: "rotated",
            },

            // ================= COLOR ENGINE =================

            // Normalize
            {
              filter: "normalize",
              options: { blackpt: "black", whitept: "white", smoothing: 5 },
              inputs: "rotated",
              outputs: "norm",
            },

            // Pre-LUT Cleanup
            {
              filter: "eq",
              options: { contrast: 1.03, brightness: 0.01, saturation: 1.02 },
              inputs: "norm",
              outputs: "pre_lut",
            },

            // Split
            {
              filter: "split",
              inputs: "pre_lut",
              outputs: ["base", "to_lut"],
            },

            // LUT (tetrahedral interpolation)
            {
              filter: "lut3d",
              options: { file: rawLutPath, interp: "tetrahedral" },
              inputs: "to_lut",
              outputs: "lut_applied",
            },

            // LUT Blend
            {
              filter: "blend",
              options: { all_expr: "A*0.55 + B*0.45" },
              inputs: ["base", "lut_applied"],
              outputs: "blended",
            },

            // Cinematic Soft Finish
            {
              filter: "eq",
              options: { contrast: 0.97, saturation: 0.93, gamma: 1.02 },
              inputs: "blended",
              outputs: "outv",
            },
          ],
        };
      },
    };
  });
};
