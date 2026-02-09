import path from "path";
import { app } from "electron";

export const getLutPath = (fileName) => {
  const p = app.isPackaged
    ? path.join(process.resourcesPath, "luts", fileName)
    : path.join(app.getAppPath(), "src", "luts", fileName);

  // Format for FFmpeg (handling Windows backslashes)
  return p.replace(/\\/g, "/").replace(/:/g, "\\:");
};
