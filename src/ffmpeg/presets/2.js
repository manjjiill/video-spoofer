import { app } from "electron";
import path from "path";

export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", fileName)
    : path.join(app.getAppPath(), "src", "luts", fileName);

  // 1. Normalize to forward slashes
  let normalizedPath = path.resolve(fullPath).split(path.sep).join("/");

  if (process.platform === "win32") {
    // 2. Escape the colon: D:/... -> D\:/...
    normalizedPath = normalizedPath.replace(/:/g, "\\:");
    // 3. Wrap in single quotes: 'D\:/path/to.cube'
    return `'${normalizedPath}'`;
  }

  return normalizedPath;
};

const LUT_FILES = [
  "hong-kong.cube",
  "cine-wedding.cube",
  "forest.cube",
  "neutral.cube",
  "greensky.cube",
  "cool-soft.cube",
  "vintage-gold.cube",
  "arrival.cube",
];

export const PRESETS_SET_2 = Array.from({ length: 2 }).map((_, i) => {
  return {
    id: i + 1,
    build: () => {
      const randomLut = LUT_FILES[Math.floor(Math.random() * LUT_FILES.length)];
      const rawLutPath = getLutPath(randomLut);

      // Random Crop between 0.05 (5%) and 0.25 (25%)
      const cropPercent = (Math.random() * (0.25 - 0.05) + 0.05).toFixed(2);
      const remainingHeight = (1 - cropPercent).toFixed(2);
      const yOffset = (cropPercent / 2).toFixed(2);

      const randomTempo = (Math.random() * (0.98 - 0.94) + 0.94).toFixed(3);
      const rateAdjustment = (44100 * (1 / randomTempo)).toFixed(0);

      console.log(
        `[Preset ${i + 1}] LUT: ${randomLut}, Crop: ${cropPercent}, Tempo: ${randomTempo}`,
      );

      return {
        mode: "complex",
        args: [
          "-map",
          "0:a?",
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-af",
          `asetrate=${rateAdjustment},aresample=44100,atempo=${randomTempo}`,
          "-crf",
          "18",
        ],
        complexFilters: [
          // 1. BG: Scale down fast
          {
            filter: "scale",
            options: { w: 360, h: 640, flags: "bilinear" },
            inputs: "0:v",
            outputs: "bg_small",
          },
          // 2. BG: Fast Blur
          {
            filter: "boxblur",
            options: { lr: 10, lp: 2 },
            inputs: "bg_small",
            outputs: "bg_blur",
          },
          // 3. BG: Scale up
          {
            filter: "scale",
            options: { w: 1080, h: 1920 },
            inputs: "bg_blur",
            outputs: "bg_final",
          },
          // 4. FG: Random Crop (Top/Bottom)
          {
            filter: "crop",
            options: {
              w: "iw",
              h: `ih*${remainingHeight}`,
              x: 0,
              y: `ih*${yOffset}`,
            },
            inputs: "0:v",
            outputs: "fg_crop",
          },
          // 5. FG: Scale & Apply LUT
          {
            filter: "scale",
            options: { w: 1080, h: -2, flags: "lanczos" },
            inputs: "fg_crop",
            outputs: "fg_scaled",
          },
          {
            filter: "lut3d",
            options: `file=${rawLutPath}`,
            inputs: "fg_scaled",
            outputs: "fg_colored",
          },
          // 6. Final Overlay
          {
            filter: "overlay",
            options: { x: "(W-w)/2", y: "(H-h)/2" },
            inputs: ["bg_final", "fg_colored"],
            outputs: "outv",
          },
        ],
      };
    },
  };
});
