import { initFolderSelectors } from "./folders.js";
import { initVariationInput } from "./variations.js";
import { initActions } from "./actions.js";
import { initProgress } from "./progress.js";
import { initCancelModal } from "./cancelModal.js";

window.api.onFFmpegError((data) => {
  const errorBox = document.getElementById("errorBox");
  errorBox.style.display = "block";

  const presetId = data?.presetId ?? "Unknown";
  const message = data?.message ?? "Unknown error";

  const errorParagraph = document.createElement("p");
  errorParagraph.textContent = `Preset ${presetId} failed: ${message}`;

  errorBox.appendChild(errorParagraph);
});

window.addEventListener("DOMContentLoaded", async () => {
  initFolderSelectors();
  await initVariationInput();
  initActions();
  initProgress();
  initCancelModal();
});
