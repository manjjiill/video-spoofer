import { app } from "electron";
import path from "path";

const rand = (min, max) => Math.random() * (max - min) + min;

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

export const PRESETS_SET_4 = Array.from({ length: 15 }).map((_, i) => {
  const lutFileName = `${i + 1}.cube`;

  return {
    id: i + 1,
    build: () => {
      const safeLutPath = getLutPath(lutFileName);

      // 1. Calculate Random Crop (Total 5% to 15%)
      const totalCropPercent = rand(0.05, 0.15); // e.g., 0.10
      const heightMultiplier = (1 - totalCropPercent).toFixed(3); // e.g., 0.90
      const topOffsetMultiplier = (totalCropPercent / 2).toFixed(3); // e.g., 0.05

      // 2. Audio Spoofing
      const tempo = rand(0.94, 0.98).toFixed(3);
      const rateAdjustment = Math.round(44100 * (1 / tempo));

      console.log(
        `Building Preset ${i + 1}: Total Crop ${Math.round(totalCropPercent * 100)}%`,
      );

      return {
        mode: "simple",
        args: [
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-af",
          `asetrate=${rateAdjustment},aresample=44100,atempo=${tempo}`,
        ],
        filters: [
          `crop=iw:ih*${heightMultiplier}:0:ih*${topOffsetMultiplier}`,
          "hflip",
          `lut3d=file=${safeLutPath}`,
          "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
        ].join(","),
      };
    },
  };
});
