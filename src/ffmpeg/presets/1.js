import { app } from "electron";
import path from "path";

export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", "vivid", fileName)
    : path.join(app.getAppPath(), "src", "luts", "vivid", fileName);

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
            {
              filter: "eq",
              options: {
                brightness: 0.02,
                contrast: 1.03,
                saturation: 1.04,
              },
              inputs: "0:v",
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
                file: lutPath,
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
              outputs: "color_safe",
            },

            {
              filter: "hflip",
              inputs: "color_safe",
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
