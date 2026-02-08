import { appState } from "./state.js";
import { updateActionButtons } from "./actions.js";

export function initFolderSelectors() {
  const inputBox = document.getElementById("inputPath");
  const inputWrapper = document.getElementById("inputWrapper");
  const outputWrapper = document.getElementById("outputWrapper");
  const outputBox = document.getElementById("outputPath");

  const browseInputBtn = document.getElementById("browseInput");
  const browseOutputBtn = document.getElementById("browseOutput");

  browseInputBtn.addEventListener("click", async () => {
    const path = await window.api.pickInputVideo();
    if (!path) return;

    appState.inputVideo = path;
    inputBox.textContent = path;
    inputBox.classList.remove("has-text-grey");
    inputWrapper.classList.add("is-valid");

    updateActionButtons();
  });

  browseOutputBtn.addEventListener("click", async () => {
    const path = await window.api.pickOutputDir();
    if (!path) return;

    appState.outputDir = path;
    outputBox.textContent = path;
    outputBox.classList.remove("has-text-grey");
    outputWrapper.classList.add("is-valid");

    updateActionButtons();
  });
}
