import path from "path";
import { PRESETS_SET_1 } from "./1.js";
import { app } from "electron";
import { PRESETS_SET_2 } from "./2.js";
import { PRESETS_SET_3 } from "./3.js";

export const PRESETS = [
  // ...PRESETS_SET_1,
  // ...PRESETS_SET_2,
  ...PRESETS_SET_3,

  // {
  //   id: 7,
  //   build: () => ({
  //     mode: "complex",
  //     args: [
  //       // ✅ explicitly map audio
  //       "-map",
  //       "0:a?",
  //       // ✅ re-encode audio (required for -af)
  //       "-c:a",
  //       "aac",
  //       "-b:a",
  //       "128k",
  //       // 🎧 keep higher pitch (spoof)
  //       "-af",
  //       "asetrate=44100*1.04,aresample=44100,atempo=0.96",
  //     ],
  //     complexFilters: [
  //       // 1) Background: downscale hard (FAST)
  //       {
  //         filter: "scale",
  //         options: { w: 360, h: 640 },
  //         inputs: "0:v",
  //         outputs: "bg_small",
  //       },
  //       // 2) Blur background
  //       {
  //         filter: "gblur",
  //         options: { sigma: 20 },
  //         inputs: "bg_small",
  //         outputs: "bg_blur",
  //       },
  //       // 3) Scale blurred bg to vertical canvas
  //       {
  //         filter: "scale",
  //         options: { w: 1080, h: 1920 },
  //         inputs: "bg_blur",
  //         outputs: "bg_final",
  //       },
  //       // 4) Foreground: crop TOP & BOTTOM by 10%
  //       {
  //         filter: "crop",
  //         options: {
  //           w: "iw",
  //           h: "ih*0.8", // 80% height kept
  //           x: 0,
  //           y: "ih*0.1", // 10% from top
  //         },
  //         inputs: "0:v",
  //         outputs: "fg_crop",
  //       },
  //       // 5) Convert foreground to black & white
  //       {
  //         filter: "hue",
  //         options: { s: 0 },
  //         inputs: "fg_crop",
  //         outputs: "fg_bw",
  //       },
  //       // 6) Scale foreground
  //       {
  //         filter: "scale",
  //         options: { w: 1080, h: -2 },
  //         inputs: "fg_bw",
  //         outputs: "fg_scaled",
  //       },
  //       // 7) Overlay B&W foreground on blurred background
  //       {
  //         filter: "overlay",
  //         options: {
  //           x: "(W-w)/2",
  //           y: "(H-h)/2",
  //         },
  //         inputs: ["bg_final", "fg_scaled"],
  //         outputs: "outv",
  //       },
  //     ],
  //   }),
  // },
];
