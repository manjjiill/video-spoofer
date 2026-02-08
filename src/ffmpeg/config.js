import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";
import path from "path";
import { app } from "electron";

// 1. Get the path provided by the installer
let ffmpegPath = ffmpegInstaller.path;

// 2. If we are in production, the path needs to point to the internal Resources folder
if (app.isPackaged) {
  // We replace the dev path with the path inside the Mac .app bundle
  ffmpegPath = ffmpegPath.replace(
    /^.*node_modules/,
    path.join(process.resourcesPath, "app.asar.unpacked", "node_modules"),
  );
}

ffmpeg.setFfmpegPath(ffmpegPath);

export default ffmpeg;
