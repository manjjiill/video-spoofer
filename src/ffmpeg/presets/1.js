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
  "16.cube",
  "17.cube",
  "18.cube",
  "19.cube",
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
];

const SHUFFLED_LUTS = [...LUT_FILES].sort(() => Math.random() - 0.5);

export const generatePresetsSet1 = (startId) => {
  return Array.from({ length: LUT_FILES.length }).map((_, i) => {
    const uniqueId = startId + i;

    return {
      id: uniqueId,
      build: () => {
        const lutName = SHUFFLED_LUTS[i % SHUFFLED_LUTS.length];
        const rawLutPath = getLutPath(lutName);

        const randomAngle = (Math.random() * 30 - 15).toFixed(2);
        const randomScale = (Math.random() * 0.2 + 0.8).toFixed(2);

        console.log(`Building Preset ${i + 1}`);

        return {
          mode: "simple",
          filters: [
            // Normalize BEFORE LUT
            "eq=contrast=1.05:brightness=0.015:saturation=1.05",
            "curves=preset=medium_contrast",

            // Apply LUT correctly
            `lut3d=${rawLutPath}:interp=tetrahedral`,

            // Post-LUT Softening
            "eq=contrast=0.95:saturation=0.95",

            // Transforms
            "hflip",
            `scale=iw*${randomScale}:ih*${randomScale}:flags=lanczos`,
            `rotate=${randomAngle}*PI/180:fillcolor=black`,

            // FINAL resolution
            "scale=1080:1920:flags=lanczos:force_original_aspect_ratio=decrease",

            "noise=alls=40:allf=t+u",
            // This makes the grain look like actual film stock
            "boxblur=1:1",
            // Sharpen the edges of the grain so it pops
            "unsharp=5:5:0.8:5:5:0.8",

            // Pad last
            "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
          ].join(","),
        };
      },
    };
  });
};
