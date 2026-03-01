import { app } from "electron";
import path from "path";

export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", "bw", fileName)
    : path.join(app.getAppPath(), "src", "luts", "bw", fileName);

  let normalized = path.resolve(fullPath).replace(/\\/g, "/");

  if (process.platform === "win32") {
    normalized = normalized.replace(/:/g, "\\:");
  }

  return `'${normalized}'`;
};

const getMaskPath = () => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "assets", "frame.png")
    : path.join(app.getAppPath(), "src", "assets", "frame.png");

  return path.resolve(fullPath);
};

const getGradientPath = () => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "assets", "gradient-5.png")
    : path.join(app.getAppPath(), "src", "assets", "gradient-5.png");

  return path.resolve(fullPath);
};

const getRandomRotation = () => {
  const min = 3;
  const max = 8;
  const deg = Math.random() * (max - min) + min;
  const sign = Math.random() < 0.5 ? -1 : 1;
  return (deg * sign * Math.PI) / 180;
};

const LUT_FILES = [
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

export const generatePresetsSet9 = (startId) => {
  return Array.from({ length: LUT_FILES.length }).map((_, i) => {
    const uniqueId = startId + i;
    const randomAngle = getRandomRotation();

    return {
      id: uniqueId,

      build: () => {
        const lutName = SHUFFLED_LUTS[i % SHUFFLED_LUTS.length];
        const lutPath = getLutPath(lutName);
        const maskPath = getMaskPath();
        const gradientPath = getGradientPath();

        return {
          mode: "complex",

          // 👇 VERY IMPORTANT: This tells your ffmpeg runner
          // to add these as additional -i inputs
          extraInputs: [maskPath, gradientPath],

          complexFilters: [
            /* ================= COLOR ENGINE ================= */

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
              filter: "scale",
              options: { w: 1010, h: 1870 },
              inputs: "base_safe",
              outputs: "fg_scaled",
            },

            {
              filter: "lut3d",
              options: {
                file: lutPath,
                interp: "tetrahedral",
              },
              inputs: "fg_scaled",
              outputs: "fg_lut",
            },

            {
              filter: "curves",
              options: {
                r: "0/0 0.75/0.73 1/0.97",
                g: "0/0 0.75/0.73 1/0.97",
                b: "0/0 0.75/0.73 1/0.97",
              },
              inputs: "fg_lut",
              outputs: "fg_protected",
            },

            /* ================= APPLY MASK ================= */

            {
              filter: "format",
              options: { pix_fmts: "rgba" },
              inputs: "fg_protected",
              outputs: "fg_rgba",
            },

            {
              filter: "scale",
              options: { w: 1010, h: 1870 },
              inputs: "1:v", // mask
              outputs: "mask_scaled",
            },

            {
              filter: "alphamerge",
              inputs: ["fg_rgba", "mask_scaled"],
              outputs: "fg_masked",
            },

            /* ================= ROTATE ================= */

            {
              filter: "rotate",
              options: {
                angle: randomAngle,
                fillcolor: "none",
                ow: "rotw(iw)",
                oh: "roth(ih)",
              },
              inputs: "fg_masked",
              outputs: "fg_rotated",
            },

            /* ================= GRADIENT BACKGROUND ================= */

            {
              filter: "scale",
              options: { w: 1080, h: 1920 },
              inputs: "2:v", // gradient
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
