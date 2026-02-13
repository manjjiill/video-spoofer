import path from "path";
import ffmpeg from "fluent-ffmpeg";
import fs from "fs";
import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import { buildFFmpegJob } from "./ffmpeg/buildArgs.js";
import { runFFmpeg, stopFFmpeg } from "./ffmpeg/index.js";
import { pickRandomPresets } from "./ffmpeg/selector.js";
import { fileURLToPath } from "url";

function getDuration(input) {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(input, (err, data) => {
      if (err) return reject(err);
      resolve(data.format.duration); // seconds
    });
  });
}

const VIDEO_EXTENSIONS = [
  ".mp4",
  ".mov",
  ".mkv",
  ".avi",
  ".webm",
  ".m4v",
  ".flv",
  ".wmv",
];

const isVideo = (fileName) => {
  return VIDEO_EXTENSIONS.includes(path.extname(fileName).toLowerCase());
};

function timemarkToSeconds(t) {
  const parts = t.split(":").map(Number);
  if (parts.length === 3) {
    return parts[0] * 3600 + parts[1] * 60 + parts[2];
  }
  return 0;
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let mainWindow;
let isCancelled = false;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
    icon: path.join(__dirname, "assets/Icon.png"),
  });

  mainWindow.loadFile(path.join(__dirname, "index.html"));
}

ipcMain.handle("pick-input-video", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openFile", "openDirectory"],
    filters: [{ name: "Videos", extensions: VIDEO_EXTENSIONS }],
  });

  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("pick-output-dir", async () => {
  const result = await dialog.showOpenDialog({
    properties: ["openDirectory"],
  });

  return result.canceled ? null : result.filePaths[0];
});

ipcMain.handle("start-processing", async (_, payload) => {
  const { input, outputDir, variations } = payload;
  isCancelled = false;

  // new process
  // 1. Identify all videos to process
  let videoQueue = [];
  const stats = fs.statSync(input);

  if (stats.isDirectory()) {
    videoQueue = fs
      .readdirSync(input)
      .filter(isVideo)
      .map((file) => path.join(input, file));
  } else {
    videoQueue = [input];
  }

  if (videoQueue.length === 0) return { done: false, error: "No videos found" };

  const totalVideos = videoQueue.length;
  const totalTasks = totalVideos * variations;
  let globalCounter = 0;

  const { PRESETS } = await import(
    `./ffmpeg/presets/index.js?update=${Date.now()}`
  );

  for (let vIdx = 0; vIdx < totalVideos; vIdx++) {
    if (isCancelled) return { cancelled: true };

    const currentVideoPath = videoQueue[vIdx];
    const videoName = path.basename(currentVideoPath);
    const totalDuration = await getDuration(currentVideoPath);

    const selectedPresets = pickRandomPresets(PRESETS, variations);

    console.log(selectedPresets, "presets");

    for (let pIdx = 0; pIdx < selectedPresets.length; pIdx++) {
      if (isCancelled) return { cancelled: true };

      const preset = selectedPresets[pIdx];
      const currentPresetNumber = pIdx + 1;

      const args = buildFFmpegJob({
        input: currentVideoPath,
        outputDir: outputDir,
        preset: preset,
        index: currentPresetNumber,
      });

      try {
        await runFFmpeg({
          ...args,
          onProgress: (p) => {
            if (!p.timemark) return;
            const seconds = timemarkToSeconds(p.timemark);
            const percent = Math.min(
              100,
              Math.max(0, Math.round((seconds / totalDuration) * 100)),
            );

            mainWindow.webContents.send("preset-progress", {
              current: currentPresetNumber,
              total: variations,
              percent,
            });
          },
        });

        globalCounter++;

        mainWindow.webContents.send("processing-progress", {
          current: globalCounter,
          total: totalTasks,
          percent: Math.round((globalCounter / totalTasks) * 100),
        });
      } catch (err) {
        console.error(
          `Error processing ${videoName} preset ${currentPresetNumber}:`,
          err,
        );
        globalCounter++;
      }
    }
  }

  return { done: true };
});

ipcMain.handle("stop-processing", () => {
  isCancelled = true;
  stopFFmpeg();
});

ipcMain.handle("get-preset-count", async () => {
  const { PRESETS } = await import(
    `./ffmpeg/presets/index.js?update=${Date.now()}`
  );

  return PRESETS.length;
});

ipcMain.handle("get-total-task-count", async (_, { input, variations }) => {
  const stats = fs.statSync(input);
  let videoCount = 0;

  if (stats.isDirectory()) {
    const files = fs.readdirSync(input);
    videoCount = files.filter((file) => {
      const ext = path.extname(file).toLowerCase();
      return VIDEO_EXTENSIONS.includes(ext);
    }).length;
  } else {
    videoCount = 1;
  }

  return videoCount * variations;
});

ipcMain.handle("open-folder", async (_e, folderPath) => {
  await shell.openPath(folderPath);
  return true;
});

app.whenReady().then(() => {
  if (process.platform === "darwin" && app.dock) {
    app.dock.setIcon(path.join(__dirname, "assets/Icon.png"));
  }

  createWindow();
});
