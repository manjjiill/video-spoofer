import { openCancelModal } from "./cancelModal.js";
import { updateProgressVisibility } from "./progress.js";
import { resetUI } from "./resetUI.js";
import { appState, resetState } from "./state.js";

let startBtn;
let stopBtn;

export function initActions() {
  startBtn = document.getElementById("startBtn");
  stopBtn = document.getElementById("stopBtn");

  if (!startBtn || !stopBtn) {
    console.error("❌ Action buttons not found");
    return;
  }

  // Stop disabled by default
  stopBtn.disabled = true;
  startBtn.disabled = true;

  startBtn.addEventListener("click", async () => {
    if (!canStart()) return;

    appState.isProcessing = true;

    const progressLabel = document.querySelector(".filesDone");
    if (progressLabel) {
      progressLabel.textContent = `0/${appState.variationCount} Done`;
    }

    setLoading(true);
    updateActionButtons();
    updateProgressVisibility();

    // go to bottom
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });

    const result = await window.api.startProcessing({
      input: appState.inputVideo,
      outputDir: appState.outputDir,
      variations: appState.variationCount,
    });

    if (result?.done) {
      await window.api.openFolder(appState.outputDir);

      resetState();
      resetUI();
    } else {
      appState.isProcessing = false;
    }

    setLoading(false);
    appState.isProcessing = false;
    updateActionButtons();
    updateProgressVisibility();
  });

  stopBtn.addEventListener("click", () => {
    if (appState.isProcessing) {
      openCancelModal();
    }
  });
}

function canStart() {
  return (
    appState.inputVideo &&
    appState.outputDir &&
    appState.variationValid &&
    !appState.isProcessing
  );
}

export function updateActionButtons() {
  if (!startBtn || !stopBtn) return;

  startBtn.disabled = !canStart();
  stopBtn.disabled = !appState.isProcessing;
}

export function setLoading(isLoading) {
  if (!startBtn) return;

  startBtn.classList.toggle("is-loading", isLoading);
  startBtn.disabled = isLoading;
}
