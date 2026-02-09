import path from "path";
import { app } from "electron";

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
  "green-orange.cube",
  "sony-s-log.cube",
  "rec709.cube",
  "relatives.cube",
  "correction.cube",
];

const BG_COLORS = [
  "#FDC3A1",
  "#9CCFFF",
  "#685AFF",
  "#C0B87A",
  "#547792",
  "#628141",
  "#B7BDF7",
  "#F075AE",
  "#9BC264",
  "#222222",
  "#F63049",
  "#FF5B5B",
  "#ACBFA4",
  "#4D2B8C",
  "#3291B6",
];

const rand = (min, max) => Math.random() * (max - min) + min;
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];

export const PRESETS_SET_3 = Array.from({ length: 20 }).map((_, i) => ({
  id: i + 1,

  build: () => {
    const randomLutName = pick(LUT_FILES);
    const rawLutPath = getLutPath(randomLutName);

    const rawBg = pick(BG_COLORS);
    const bg = rawBg.replace("#", "0x");

    const cropW = rand(0.05, 0.1).toFixed(2);
    const cropH = rand(0.05, 0.25).toFixed(2);

    const isNegative = Math.random() > 0.5;
    const rotDeg = isNegative ? rand(-15, -5) : rand(5, 15);
    const rotRad = (rotDeg * Math.PI) / 180;

    const tempo = rand(0.94, 0.98).toFixed(3);
    const rate = Math.round(44100 / tempo);

    console.log(
      `🎞️ Preset ${i + 1} | Color ${rawBg} | Rotation ${rotDeg.toFixed(1)}°`,
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
        `asetrate=${rate},aresample=44100,atempo=${tempo}`,
      ],

      complexFilters: [
        // 1. Create Background
        {
          filter: "color",
          options: { c: bg, s: "1080x1920" },
          outputs: "bg",
        },
        // 2. Crop
        {
          filter: "crop",
          inputs: "0:v",
          options: {
            w: `iw*(1-${cropW})`,
            h: `ih*(1-${cropH})`,
            x: "(iw-ow)/2",
            y: "(ih-oh)/2",
          },
          outputs: "crop",
        },
        // 3. Scale
        {
          filter: "scale",
          inputs: "crop",
          options: { w: 960, h: -2 },
          outputs: "scaled",
        },
        // 4. Apply LUT
        {
          filter: "lut3d",
          inputs: "scaled",
          options: `file=${rawLutPath}`,
          outputs: "colored",
        },
        // 5. NEW: Convert to RGBA so rotation 'fillcolor=none' actually works
        {
          filter: "format",
          inputs: "colored",
          options: "rgba",
          outputs: "ready_to_rotate",
        },
        // 6. Rotate (fillcolor=none now refers to the alpha channel)
        {
          filter: "rotate",
          inputs: "ready_to_rotate",
          options: {
            angle: rotRad,
            fillcolor: "none",
            ow: "hypot(iw,ih)",
            oh: "hypot(iw,ih)",
          },
          outputs: "rotated",
        },
        // 7. Final Overlay (Will now show 'bg' through the rotated corners)
        {
          filter: "overlay",
          inputs: ["bg", "rotated"],
          options: {
            x: "(W-w)/2",
            y: "(H-h)/2",
            shortest: 1,
          },
          outputs: "outv",
        },
      ],
    };
  },
}));
