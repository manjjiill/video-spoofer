export const DEFAULT_VARIATION = 0;

export const appState = {
  inputVideo: null,
  outputDir: null,
  variationCount: DEFAULT_VARIATION,
  variationValid: true,
  isProcessing: false,
};

export function resetState() {
  appState.inputVideo = null;
  appState.outputDir = null;
  appState.variationCount = DEFAULT_VARIATION;
  appState.variationValid = true;
  appState.isProcessing = false;
}
