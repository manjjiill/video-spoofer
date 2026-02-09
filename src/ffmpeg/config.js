// import ffmpeg from "fluent-ffmpeg";
// import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
// import path from "path";
// import { app } from "electron";

// // 1. Get the path provided by the installer
// let ffmpegPath = ffmpegInstaller.path;

// // 2. If we are in production, the path needs to point to the internal Resources folder
// if (app.isPackaged) {
//   // We replace the dev path with the path inside the Mac .app bundle
//   ffmpegPath = ffmpegPath.replace(
//     /^.*node_modules/,
//     path.join(process.resourcesPath, "app.asar.unpacked", "node_modules"),
//   );
// }

// ffmpeg.setFfmpegPath(ffmpegPath);

// export default ffmpeg;

import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import ffprobeInstaller from "@ffprobe-installer/ffprobe";
import path from "path";
import { app } from "electron";

// Base paths from installers (dev mode)
let ffmpegPath = ffmpegInstaller.path;
let ffprobePath = ffprobeInstaller.path;

// In packaged app, binaries live in app.asar.unpacked
if (app.isPackaged) {
  ffmpegPath = path.join(
    process.resourcesPath,
    "app.asar.unpacked",
    "node_modules",
    "@ffmpeg-installer",
    process.platform === "win32" ? "win32-x64" : "darwin-arm64",
    process.platform === "win32" ? "ffmpeg.exe" : "ffmpeg",
  );

  ffprobePath = path.join(
    process.resourcesPath,
    "app.asar.unpacked",
    "node_modules",
    "@ffprobe-installer",
    process.platform === "win32" ? "win32-x64" : "darwin-arm64",
    process.platform === "win32" ? "ffprobe.exe" : "ffprobe",
  );
}

// 🔥 Explicitly set BOTH
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

// Optional: log once for sanity
console.log("FFmpeg path:", ffmpegPath);
console.log("FFprobe path:", ffprobePath);

export default ffmpeg;
