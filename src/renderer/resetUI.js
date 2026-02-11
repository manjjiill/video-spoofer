import { DEFAULT_VARIATION } from "./state.js";

export function resetUI() {
  const inputWrapper = document.getElementById("inputWrapper");
  const outputWrapper = document.getElementById("outputWrapper");

  // input / output boxes
  document.getElementById("inputPath").textContent =
    "Bitte Eingabevideo auswählen (.mp4)";
  document.getElementById("outputPath").textContent =
    "Bitte Ausgabeordner auswählen";
  const inputBox = document.getElementById("inputPath");
  const outputBox = document.getElementById("outputPath");

  // variation input
  const variationInput = document.getElementById("variationCount");
  variationInput.value = DEFAULT_VARIATION;

  inputBox.classList.remove("is-valid");
  outputBox.classList.remove("is-valid");

  outputWrapper.classList.remove("is-valid");
  inputWrapper.classList.remove("is-valid");

  // progress UI
  const progress = document.querySelector("progress");
  const label = document.querySelector(".filesDone");

  progress.value = 0;
  label.textContent = "0/0 Done";
}
