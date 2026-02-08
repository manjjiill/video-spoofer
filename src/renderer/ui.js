import { initFolderSelectors } from "./folders.js";
import { initVariationInput } from "./variations.js";
import { initActions } from "./actions.js";
import { initProgress } from "./progress.js";
import { initCancelModal } from "./cancelModal.js";

window.addEventListener("DOMContentLoaded", async () => {
  initFolderSelectors();
  await initVariationInput();
  initActions();
  initProgress();
  initCancelModal();
});
