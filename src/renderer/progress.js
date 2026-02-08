import { appState } from "./state.js";

let container;
let progress;
let label;

export function initProgress() {
  container = document.querySelector(".progressContainer");
  if (!container) return;

  progress = container.querySelector("progress");
  label = container.querySelector(".filesDone");

  window.api.onProgress(({ current, total, percent }) => {
    progress.value = percent;
    label.textContent = `${current}/${total} Done`;
  });

  updateProgressVisibility();
}

export function updateProgressVisibility() {
  if (!container) return;

  if (appState.isProcessing) {
    container.classList.remove("is-hidden");
  } else {
    container.classList.add("is-hidden");
    progress.value = 0;
    label.textContent = "0/0 Done";
  }
}
