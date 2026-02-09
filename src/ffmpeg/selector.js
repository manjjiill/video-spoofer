export function pickRandomPresets(PRESETS, variationCount) {
  const shuffled = [...PRESETS];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled.slice(0, variationCount);
}

// export function pickRandomPresets(PRESETS, variationCount) {
//   const picked = PRESETS.slice(0, variationCount);

//   return picked.map((preset) => {
//     const built = preset.build();

//     if (Array.isArray(built)) {
//       return {
//         ...preset,
//         build: () => ({
//           args: built,
//           filters: null,
//         }),
//       };
//     }

//     return preset;
//   });
// }
