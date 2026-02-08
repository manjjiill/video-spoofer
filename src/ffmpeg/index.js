import ffmpeg from "./config.js";
import fs from "fs";
import path from "path";

let currentCommand = null;

function getVideoCodec() {
  if (process.platform === "darwin") return "h264_videotoolbox";
  return "libx264";
}

export function runFFmpeg({
  input,
  output,
  args = [],
  filters,
  complexFilters,
  mode,
}) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(output), { recursive: true });

    const codec = getVideoCodec();

    let outputOptions = [
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-threads",
      "2",
      "-preset",
      "veryfast",
      "-tune",
      "zerolatency",
      ...args,
    ];

    if (codec === "h264_videotoolbox") {
      outputOptions.push("-allow_sw", "1");
    }

    let cmd = ffmpeg()
      .input(input)
      .videoCodec(codec)
      .outputOptions(outputOptions)
      .output(output);

    if (mode === "simple" && filters) {
      cmd = cmd.videoFilters(filters);
    }

    if (mode === "complex" && complexFilters) {
      cmd = cmd.complexFilter(complexFilters, "outv");
    }

    currentCommand = cmd
      .on("start", (cmd) => console.log("FFmpeg:", cmd))
      // .on("stderr", (line) => console.log(line))
      .on("end", resolve)
      .on("error", reject)
      .run();
  });
}

export function stopFFmpeg() {
  if (!currentCommand) return;

  try {
    if (process.platform === "win32") {
      currentCommand.kill();
    } else {
      currentCommand.kill("SIGTERM");
    }
  } catch (e) {
    console.error("Failed to stop ffmpeg:", e);
  }

  currentCommand = null;
}
