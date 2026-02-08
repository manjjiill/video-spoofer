import { app } from "electron";
import path from "path";

const getLutPath = (fileName) => {
  const p = app.isPackaged
    ? path.join(process.resourcesPath, "luts", fileName)
    : path.join(app.getAppPath(), "src", "luts", fileName);
  return p.replace(/\\/g, "/").replace(/:/g, "\\:");
};

const LUT_FILES = [
  "thriller.cube",
  "filmlook.cube",
  "killstreak.cube",
  "kold.cube",
  "wondar-woman.cube",
  "blackmagic.cube",
];

export const PRESETS_SET_1 = Array.from({ length: 10 }).map((_, i) => {
  return {
    id: i + 1,
    build: () => {
      const randomLutName =
        LUT_FILES[Math.floor(Math.random() * LUT_FILES.length)];
      const lutPath = getLutPath(randomLutName);

      const randomAngle = (Math.random() * 30 - 15).toFixed(2);
      const randomScale = (Math.random() * 0.2 + 0.8).toFixed(2);

      // Random Audio Tempo (between 0.94 and 0.98)
      // This subtly slows down the audio, changing the duration
      const randomTempo = (Math.random() * (0.98 - 0.94) + 0.94).toFixed(3);

      // Calculate inverse pitch (to keep audio sounding natural if you wish)
      // Or just stick to the tempo change for simplicity
      const rateAdjustment = (44100 * (1 / randomTempo)).toFixed(0);

      console.log(
        `Building Preset ${i + 1}: Angle ${randomAngle}, Scale ${randomScale}`,
      );

      return {
        mode: "simple",
        args: [
          "-c:a",
          "aac",
          "-b:a",
          "128k",
          "-af",
          `asetrate=${rateAdjustment},aresample=44100,atempo=${randomTempo}`,
        ],
        filters: [
          "hflip",
          `scale=iw*${randomScale}:ih*${randomScale}`,
          `rotate=${randomAngle}*PI/180:fillcolor=black`,
          `lut3d='${lutPath}'`,
          "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
        ].join(","),
      };
    },
  };
});
