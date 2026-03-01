import { app } from "electron";
import path from "path";

export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", "crop", fileName)
    : path.join(app.getAppPath(), "src", "luts", "crop", fileName);

  let normalized = path.resolve(fullPath).replace(/\\/g, "/");

  if (process.platform === "win32") {
    normalized = normalized.replace(/:/g, "\\:");
  }

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

        const rotationDeg = Math.random() * 3 + 2; // 2 → 5
        const rotationSign = Math.random() < 0.5 ? -1 : 1;
        const randomAngle = (rotationDeg * rotationSign * Math.PI) / 180;

        const cropPercent = Math.random() * (0.2 - 0.14) + 0.14;

        return {
          mode: "complex",
          complexFilters: [
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

            {
              filter: "eq",
              options: {
                brightness: 0.02,
                contrast: 1.03,
                saturation: 1.04,
              },
              inputs: "final_base",
              outputs: "base_norm",
            },

            {
              filter: "curves",
              options: {
                r: "0/0.03 0.2/0.22 1/1",
                g: "0/0.03 0.2/0.22 1/1",
                b: "0/0.03 0.2/0.22 1/1",
              },
              inputs: "base_norm",
              outputs: "base_safe",
            },

            {
              filter: "lut3d",
              options: {
                file: rawLutPath,
                interp: "tetrahedral",
              },
              inputs: "base_safe",
              outputs: "lut_applied",
            },

            {
              filter: "curves",
              options: {
                r: "0/0 0.75/0.73 1/0.97",
                g: "0/0 0.75/0.73 1/0.97",
                b: "0/0 0.75/0.73 1/0.97",
              },
              inputs: "lut_applied",
              outputs: "outv",
            },
          ],
        };
      },
    };
  });
};
