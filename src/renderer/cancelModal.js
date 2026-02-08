import { appState } from "./state.js";
import { setLoading, updateActionButtons } from "./actions.js";
import { updateProgressVisibility } from "./progress.js";

let modal;

export function initCancelModal() {
  modal = document.getElementById("cancelModal");

  const closeButtons = modal.querySelectorAll(
    ".modal-background, .delete, #cancelCancel",
  );
  const confirmBtn = modal.querySelector("#confirmCancel");

  closeButtons.forEach((btn) => btn.addEventListener("click", closeModal));

  confirmBtn.addEventListener("click", () => {
    window.api.stopProcessing();
    appState.isProcessing = false;

    setLoading(false);
    updateActionButtons();
    updateProgressVisibility();
    closeModal();
  });
}

export function openCancelModal() {
  if (!modal) return;
  modal.classList.add("is-active");
}

function closeModal() {
  modal.classList.remove("is-active");
}
