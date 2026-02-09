import { appState } from "./state.js";

let container;
let progress;
let label;
let fileProgressText;
let loader;

export function initProgress() {
  container = document.querySelector(".progressContainer");
  if (!container) return;

  progress = container.querySelector("progress");
  label = container.querySelector(".filesDone");

  fileProgressText = document.querySelector(".fileProgressText");
  loader = document.querySelector(".loader");

  window.api.onProgress(({ current, total, percent }) => {
    progress.value = percent;
    label.textContent = `${current}/${total} Done`;
  });

  window.api.onPresetProgress(({ current, total, percent }) => {
    const safePercent = Math.round(percent || 0);

    if (fileProgressText) {
      fileProgressText.textContent = `${safePercent}% (Generating Varianten ${current})`;
    }
    if (loader) loader.style.display = "inline-block";
  });

  updateProgressVisibility();
}

export function updateProgressVisibility() {
  if (!container) return;

  if (appState.isProcessing) {
    container.classList.remove("is-hidden");
  } else {
    container.classList.add("is-hidden");

    if (progress) progress.value = 0;
    if (label) label.textContent = "0/0 Done";
    if (loader) loader.style.display = "none";
    if (fileProgressText) fileProgressText.textContent = "";
  }
}
