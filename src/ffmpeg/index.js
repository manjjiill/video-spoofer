import ffmpeg from "./config.js";
import fs from "fs";
import path from "path";

let currentCommand = null;

export function runFFmpeg({
  input,
  maskPath,
  bgInput,
  output,
  filters,
  complexFilters,
  mode,
  onProgress,
}) {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(output), { recursive: true });

    let outputOptions = [
      "-preset",
      // "slow",
      "medium",
      "-crf",
      // "18",
      "21",
      "-profile:v",
      "high",
      "-level",
      "4.2",
      "-pix_fmt",
      "yuv420p",
      "-movflags",
      "+faststart",
      "-shortest",
    ];

    const pitchFactor = 1.04; // 4% higher pitch
    const tempoCorrection = (1 / pitchFactor).toFixed(5);

    // [0:v] is the main video
    let cmd = ffmpeg().input(input);

    // [1:v] is the mask (if exists)
    if (maskPath) {
      cmd = cmd.input(maskPath);
    }

    // [2:v] is the background gradient
    if (bgInput) {
      cmd = cmd.input(bgInput);
    }

    cmd = cmd
      .videoCodec("libx264")
      .audioCodec("aac")
      .audioBitrate("192k")
      .audioFilters([
        `asetrate=44100*${pitchFactor}`,
        "aresample=44100",
        `atempo=${tempoCorrection}`,
      ])
      .outputOptions(outputOptions)
      .output(output);

    if (mode === "simple" && filters) {
      cmd = cmd.videoFilters(filters);
    }

    if (mode === "complex" && complexFilters) {
      cmd = cmd
        .complexFilter(complexFilters)
        .outputOptions(["-map", "[outv]", "-map", "0:a:0?"]);
    }

    currentCommand = cmd
      .on("progress", (progress) => {
        if (onProgress) onProgress(progress);
      })
      .on("start", (cmd) => {
        console.log("FFmpeg:", cmd);
      })
      .on("stderr", (line) => {
        // console.log(line);
      })
      .on("end", () => {
        resolve();
      })
      .on("error", (err, stdout, stderr) => {
        const errorMessage =
          stderr && stderr.trim().length > 0
            ? stderr
            : err?.message || "Unknown FFmpeg error";

        reject(new Error(errorMessage));
      })
      .on("exit", (code, signal) => {
        if (code !== 0) {
          let message = "";

          if (code === 137 || signal === "SIGKILL") {
            message =
              "FFmpeg was killed by the system (Possible memory limit).";
          } else if (signal) {
            message = `FFmpeg terminated by signal: ${signal}`;
          } else {
            message = `FFmpeg exited with code: ${code}`;
          }

          reject(new Error(message));
        }
      })
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
