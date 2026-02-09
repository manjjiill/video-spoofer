import path from "path";
import { fileURLToPath } from "url";
import { app } from "electron";
import { PRESETS_SET_1 } from "./presets/1.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const getLutPath = (fileName) => {
  const fullPath = app.isPackaged
    ? path.join(process.resourcesPath, "luts", fileName)
    : path.join(app.getAppPath(), "src", "luts", fileName);

  if (process.platform === "win32") {
    return fullPath.replace(/\\/g, "/").replace(/:/g, "\\:");
  }

  return fullPath;
};

export const PRESETS = [
  ...PRESETS_SET_1,
  // luts start
  // {
  //   id: 1,
  //   build: () => {
  //     const lutPath = getLutPath("1.cube")
  //       .replace(/\\/g, "/")
  //       .replace(/:/g, "\\:");

  //     return {
  //       mode: "simple",
  //       args: [
  //         // audio must be re-encoded
  //         "-c:a",
  //         "aac",
  //         "-b:a",
  //         "128k",
  //         // 🎧 slight higher pitch (spoof)
  //         "-af",
  //         "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //       ],
  //       filters: [
  //         "crop=iw:ih*0.85:0:ih*0.075",
  //         "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
  //         "hflip",
  //         `lut3d='${lutPath}'`,
  //       ].join(","),
  //     };
  //   },
  // },

  // {
  //   id: 2,
  //   build: () => {
  //     const lutPath = getLutPath("2.cube")
  //       .replace(/\\/g, "/")
  //       .replace(/:/g, "\\:");

  //     return {
  //       mode: "simple",
  //       args: [
  //         // audio must be re-encoded
  //         "-c:a",
  //         "aac",
  //         "-b:a",
  //         "128k",
  //         // 🎧 slight higher pitch (spoof)
  //         "-af",
  //         "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //       ],
  //       filters: [
  //         "crop=iw:ih*0.85:0:ih*0.075",
  //         "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
  //         "hflip",
  //         `lut3d='${lutPath}'`,
  //       ].join(","),
  //     };
  //   },
  // },

  // {
  //   id: 3,
  //   build: () => {
  //     const lutPath = getLutPath("3.cube")
  //       .replace(/\\/g, "/")
  //       .replace(/:/g, "\\:");

  //     return {
  //       mode: "simple",
  //       args: [
  //         // audio must be re-encoded
  //         "-c:a",
  //         "aac",
  //         "-b:a",
  //         "128k",
  //         // 🎧 slight higher pitch (spoof)
  //         "-af",
  //         "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //       ],
  //       filters: [
  //         "crop=iw:ih*0.85:0:ih*0.075",
  //         "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
  //         "hflip",
  //         `lut3d='${lutPath}'`,
  //       ].join(","),
  //     };
  //   },
  // },

  // {
  //   id: 4,
  //   build: () => {
  //     const lutPath = getLutPath("4.cube")
  //       .replace(/\\/g, "/")
  //       .replace(/:/g, "\\:");

  //     return {
  //       mode: "simple",
  //       args: [
  //         // audio must be re-encoded
  //         "-c:a",
  //         "aac",
  //         "-b:a",
  //         "128k",
  //         // 🎧 slight higher pitch (spoof)
  //         "-af",
  //         "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //       ],
  //       filters: [
  //         "crop=iw:ih*0.85:0:ih*0.075",
  //         "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
  //         "hflip",
  //         `lut3d='${lutPath}'`,
  //       ].join(","),
  //     };
  //   },
  // },

  // {
  //   id: 5,
  //   build: () => {
  //     const lutPath = getLutPath("5.cube")
  //       .replace(/\\/g, "/")
  //       .replace(/:/g, "\\:");

  //     return {
  //       mode: "simple",
  //       args: [
  //         // audio must be re-encoded
  //         "-c:a",
  //         "aac",
  //         "-b:a",
  //         "128k",
  //         // 🎧 slight higher pitch (spoof)
  //         "-af",
  //         "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //       ],
  //       filters: [
  //         "crop=iw:ih*0.85:0:ih*0.075",
  //         "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
  //         "hflip",
  //         `lut3d='${lutPath}'`,
  //       ].join(","),
  //     };
  //   },
  // },

  // {
  //   id: 6,
  //   build: () => {
  //     const lutPath = path
  //       .join(__dirname, "..", "luts", "6.cube")
  //       .replace(/\\/g, "/")
  //       .replace(/:/g, "\\:");

  //     return {
  //       mode: "simple",
  //       args: [
  //         // audio must be re-encoded
  //         "-c:a",
  //         "aac",
  //         "-b:a",
  //         "128k",
  //         // 🎧 slight higher pitch (spoof)
  //         "-af",
  //         "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //       ],
  //       filters: [
  //         "crop=iw:ih*0.85:0:ih*0.075",
  //         "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
  //         "hflip",
  //         `lut3d='${lutPath}'`,
  //       ].join(","),
  //     };
  //   },
  // },
  // {
  //   id: 7,
  //   build: () => {
  //     const lutPath = path
  //       .join(__dirname, "..", "luts", "7.cube")
  //       .replace(/\\/g, "/")
  //       .replace(/:/g, "\\:");

  //     return {
  //       mode: "simple",
  //       args: [
  //         // audio must be re-encoded
  //         "-c:a",
  //         "aac",
  //         "-b:a",
  //         "128k",
  //         // 🎧 slight higher pitch (spoof)
  //         "-af",
  //         "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //       ],
  //       filters: [
  //         "crop=iw:ih*0.85:0:ih*0.075",
  //         "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
  //         "hflip",
  //         `lut3d='${lutPath}'`,
  //       ].join(","),
  //     };
  //   },
  // },
  // {
  //   id: 8,
  //   build: () => {
  //     const lutPath = path
  //       .join(__dirname, "..", "luts", "8.cube")
  //       .replace(/\\/g, "/")
  //       .replace(/:/g, "\\:");

  //     return {
  //       mode: "simple",
  //       args: [
  //         // audio must be re-encoded
  //         "-c:a",
  //         "aac",
  //         "-b:a",
  //         "128k",
  //         // 🎧 slight higher pitch (spoof)
  //         "-af",
  //         "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //       ],
  //       filters: [
  //         "crop=iw:ih*0.85:0:ih*0.075",
  //         "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
  //         "hflip",
  //         `lut3d='${lutPath}'`,
  //       ].join(","),
  //     };
  //   },
  // },
  // {
  //   id: 9,
  //   build: () => {
  //     const lutPath = path
  //       .join(__dirname, "..", "luts", "9.cube")
  //       .replace(/\\/g, "/")
  //       .replace(/:/g, "\\:");

  //     return {
  //       mode: "simple",
  //       args: [
  //         // audio must be re-encoded
  //         "-c:a",
  //         "aac",
  //         "-b:a",
  //         "128k",
  //         // 🎧 slight higher pitch (spoof)
  //         "-af",
  //         "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //       ],
  //       filters: [
  //         "crop=iw:ih*0.85:0:ih*0.075",
  //         "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
  //         "hflip",
  //         `lut3d='${lutPath}'`,
  //       ].join(","),
  //     };
  //   },
  // },
  // {
  //   id: 10,
  //   build: () => {
  //     const lutPath = path
  //       .join(__dirname, "..", "luts", "10.cube")
  //       .replace(/\\/g, "/")
  //       .replace(/:/g, "\\:");

  //     return {
  //       mode: "simple",
  //       args: [
  //         // audio must be re-encoded
  //         "-c:a",
  //         "aac",
  //         "-b:a",
  //         "128k",
  //         // 🎧 slight higher pitch (spoof)
  //         "-af",
  //         "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //       ],
  //       filters: [
  //         "crop=iw:ih*0.85:0:ih*0.075",
  //         "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
  //         "hflip",
  //         `lut3d='${lutPath}'`,
  //       ].join(","),
  //     };
  //   },
  // },
  // luts end

  {
    id: 7,
    build: () => ({
      mode: "complex",
      args: [
        // ✅ explicitly map audio
        "-map",
        "0:a?",
        // ✅ re-encode audio (required for -af)
        "-c:a",
        "aac",
        "-b:a",
        "128k",
        // 🎧 keep higher pitch (spoof)
        "-af",
        "asetrate=44100*1.04,aresample=44100,atempo=0.96",
      ],
      complexFilters: [
        // 1) Background: downscale hard (FAST)
        {
          filter: "scale",
          options: { w: 360, h: 640 },
          inputs: "0:v",
          outputs: "bg_small",
        },
        // 2) Blur background
        {
          filter: "gblur",
          options: { sigma: 20 },
          inputs: "bg_small",
          outputs: "bg_blur",
        },
        // 3) Scale blurred bg to vertical canvas
        {
          filter: "scale",
          options: { w: 1080, h: 1920 },
          inputs: "bg_blur",
          outputs: "bg_final",
        },
        // 4) Foreground: crop TOP & BOTTOM by 10%
        {
          filter: "crop",
          options: {
            w: "iw",
            h: "ih*0.8", // 80% height kept
            x: 0,
            y: "ih*0.1", // 10% from top
          },
          inputs: "0:v",
          outputs: "fg_crop",
        },
        // 5) Convert foreground to black & white
        {
          filter: "hue",
          options: { s: 0 },
          inputs: "fg_crop",
          outputs: "fg_bw",
        },
        // 6) Scale foreground
        {
          filter: "scale",
          options: { w: 1080, h: -2 },
          inputs: "fg_bw",
          outputs: "fg_scaled",
        },
        // 7) Overlay B&W foreground on blurred background
        {
          filter: "overlay",
          options: {
            x: "(W-w)/2",
            y: "(H-h)/2",
          },
          inputs: ["bg_final", "fg_scaled"],
          outputs: "outv",
        },
      ],
    }),
  },
  // {
  //   id: 8,
  //   build: () => ({
  //     mode: "simple",
  //     args: [
  //       // audio must be re-encoded
  //       "-c:a",
  //       "aac",
  //       "-b:a",
  //       "128k",
  //       // 🎧 slight higher pitch (spoof)
  //       "-af",
  //       "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //     ],
  //     filters: [
  //       // 1) scale input video down
  //       "scale=iw*0.9:ih*0.9",
  //       // 2) rotate LEFT by 20 degrees
  //       "rotate=-20*PI/180:fillcolor=black",
  //       // 3) increase saturation strongly (foreground only)
  //       "eq=saturation=1.45:contrast=1.05",
  //       // 4) add soft glow (cheap & fast)
  //       //    blur → blend back via overlay-like trick
  //       "split=2[base][blur]",
  //       "[blur]gblur=sigma=10[blurred]",
  //       "[base][blurred]blend=all_mode=screen:all_opacity=0.35",
  //       // 5) pad LAST → pure black vertical background
  //       "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
  //     ].join(","),
  //   }),
  // },
  // {
  //   id: 9,
  //   build: () => ({
  //     mode: "simple",
  //     args: [
  //       // audio must be re-encoded
  //       "-c:a",
  //       "aac",
  //       "-b:a",
  //       "128k",
  //       // 🎧 slight higher pitch (spoof)
  //       "-af",
  //       "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //     ],
  //     filters: [
  //       // 1) scale input video down
  //       "scale=iw*0.9:ih*0.9",
  //       // 2) rotate RIGHT by 25 degrees
  //       "rotate=25*PI/180:fillcolor=black",
  //       // 3) slightly lower saturation (cinematic look)
  //       "eq=saturation=0.9:contrast=1.03",
  //       // 4) soft glow (lighter than previous version)
  //       "split=2[base][blur]",
  //       "[blur]gblur=sigma=8[blurred]",
  //       "[base][blurred]blend=all_mode=screen:all_opacity=0.25",
  //       // 5) pad LAST → pure black vertical background
  //       "pad=1080:1920:(ow-iw)/2:(oh-ih)/2:color=black",
  //     ].join(","),
  //   }),
  // },
  // {
  //   id: 10,
  //   build: () => ({
  //     mode: "simple",
  //     args: [
  //       // audio must be re-encoded
  //       "-c:a",
  //       "aac",
  //       "-b:a",
  //       "128k",
  //       // 🎧 slight higher pitch (spoof)
  //       "-af",
  //       "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //     ],
  //     filters: [
  //       "colorbalance=rs=0.15:gs=0.10:bs=-0.15:rm=0.10:gm=0.05:bm=-0.10",
  //       "eq=saturation=0.8:contrast=0.9:brightness=0.05",
  //       "curves=all='0/0.1 1/1'",
  //       "boxblur=1:1",
  //       "hflip",
  //     ].join(","),
  //   }),
  // },
];
