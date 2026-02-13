const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("api", {
  // folders
  pickInputVideo: () => ipcRenderer.invoke("pick-input-video"),
  pickOutputDir: () => ipcRenderer.invoke("pick-output-dir"),

  // processing
  startProcessing: (data) => ipcRenderer.invoke("start-processing", data),
  stopProcessing: () => ipcRenderer.invoke("stop-processing"),
  onProgress: (callback) =>
    ipcRenderer.on("processing-progress", (_, data) => callback(data)),
  getPresetCount: () => ipcRenderer.invoke("get-preset-count"),
  openFolder: (path) => ipcRenderer.invoke("open-folder", path),
  onPresetProgress: (cb) =>
    ipcRenderer.on("preset-progress", (_, data) => cb(data)),
  getTotalTaskCount: (payload) =>
    ipcRenderer.invoke("get-total-task-count", payload),
});
