import path from "path";
import { app, BrowserWindow, ipcMain, dialog, shell } from "electron";
import { buildFFmpegJob } from "./ffmpeg/buildArgs.js";
import { runFFmpeg, stopFFmpeg } from "./ffmpeg/index.js";
import { pickRandomPresets } from "./ffmpeg/selector.js";
import { fileURLToPath } from "url";

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
    properties: ["openFile"],
    filters: [{ name: "MP4 Videos", extensions: ["mp4"] }],
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

  const { PRESETS } = await import(
    `./ffmpeg/presets/index.js?update=${Date.now()}`
  );

  const selectedPresets = pickRandomPresets(PRESETS, variations);

  let index = 1;
  for (const preset of selectedPresets) {
    if (isCancelled) {
      return { cancelled: true };
    }

    const args = buildFFmpegJob({
      input,
      outputDir,
      preset: preset,
    });

    await runFFmpeg(args);

    mainWindow.webContents.send("processing-progress", {
      current: index,
      total: variations,
      percent: Math.round((index / selectedPresets.length) * 100),
    });

    index++;
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
