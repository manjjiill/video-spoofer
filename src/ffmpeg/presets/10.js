import { app } from "electron";
import path from "path";

export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", "mine", fileName)
    : path.join(app.getAppPath(), "src", "luts", "mine", fileName);

  let normalized = path.resolve(fullPath).replace(/\\/g, "/");

  if (process.platform === "win32") {
    normalized = normalized.replace(/:/g, "\\:");
  }

  return `'${normalized}'`;
};

const getMaskPath = () => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "assets", "border-radius.png")
    : path.join(app.getAppPath(), "src", "assets", "border-radius.png");

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

export const generatePresetsSet10 = (startId) => {
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
            /* =========================
               1️⃣ NORMALIZE
            ========================== */
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

            /* =========================
               2️⃣ SHADOW PROTECTION
            ========================== */
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
              options: { w: 1000, h: 1850 },
              inputs: "base_safe",
              outputs: "fg_scaled",
            },

            /* =========================
               3️⃣ FULL LUT (100%)
            ========================== */
            {
              filter: "lut3d",
              options: {
                file: rawLutPath,
                interp: "tetrahedral",
              },
              inputs: "fg_scaled",
              outputs: "fg_lut",
            },

            /* =========================
               4️⃣ HIGHLIGHT PROTECTION
            ========================== */
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

            /* =========================
               5️⃣ CONVERT TO RGBA
            ========================== */
            {
              filter: "format",
              options: { pix_fmts: "rgba" },
              inputs: "fg_protected",
              outputs: "fg_rgba",
            },

            /* =========================
               6️⃣ SCALE MASK
            ========================== */
            {
              filter: "scale",
              options: { w: 1000, h: 1850 },
              inputs: "1:v",
              outputs: "mask_scaled",
            },

            /* =========================
               7️⃣ APPLY ROUND MASK
            ========================== */
            {
              filter: "alphamerge",
              inputs: ["fg_rgba", "mask_scaled"],
              outputs: "fg_rounded",
            },

            /* =========================
               8️⃣ ROTATE
            ========================== */
            {
              filter: "rotate",
              options: {
                angle: randomAngle,
                fillcolor: "none",
                ow: "rotw(iw)",
                oh: "roth(ih)",
              },
              inputs: "fg_rounded",
              outputs: "fg_rotated",
            },

            /* =========================
               9️⃣ BACKGROUND
            ========================== */
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
