import { appState } from "./state.js";
import { updateActionButtons } from "./actions.js";

export async function initVariationInput() {
  const input = document.getElementById("variationCount");
  const error = document.getElementById("variationError");
  const max = await window.api.getPresetCount();

  input.max = max;
  input.value = max;
  appState.variationCount = max;

  function validate() {
    const value = Number(input.value);
    const valid = Number.isInteger(value) && value >= 1 && value <= max;

    appState.variationValid = valid;

    if (!valid) {
      error.textContent = `Value must be between 1 and ${max}`;
      error.classList.remove("is-hidden");
    } else {
      error.classList.add("is-hidden");
      appState.variationCount = value;
    }

    updateActionButtons();
  }

  input.addEventListener("input", validate);
  input.addEventListener("change", validate);
  input.addEventListener("wheel", (e) => e.preventDefault());

  validate();
}
