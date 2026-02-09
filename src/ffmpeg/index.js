import ffmpeg from "./config.js";
import fs from "fs";
import path from "path";

let currentCommand = null;

function shouldUseHardwareEncoder({ complexFilters }) {
  if (!complexFilters) return true;

  const forbidden = ["format", "alphamerge", "geq"];
  return !complexFilters.some((f) => forbidden.includes(f.filter));
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

    // const useHW =
    //   process.platform === "darwin" &&
    //   shouldUseHardwareEncoder({ complexFilters });

    // const codec = useHW ? "h264_videotoolbox" : "libx264";

    // let outputOptions = [
    //   "-pix_fmt",
    //   "yuv420p",
    //   "-movflags",
    //   "+faststart",
    //   ...(codec === "libx264"
    //     ? ["-preset", "veryfast", "-threads", "2"]
    //     : ["-allow_sw", "1"]),
    //   ...args,
    // ];

    // if (codec === "h264_videotoolbox") {
    //   outputOptions.push("-allow_sw", "1");
    // }

    let cmd = ffmpeg()
      .input(input)
      .videoCodec("libx264")
      .outputOptions([
        "-preset",
        "veryfast",
        "-pix_fmt",
        "yuv420p",
        "-movflags",
        "+faststart",
        ...args,
      ])
      .output(output);

    if (mode === "simple" && filters) {
      cmd = cmd.videoFilters(filters);
    }

    if (mode === "complex" && complexFilters) {
      cmd = cmd.complexFilter(complexFilters, "outv");
    }

    currentCommand = cmd
      .on("start", (cmd) => console.log("FFmpeg:", cmd))
      .on("stderr", (line) => console.log(line))
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
