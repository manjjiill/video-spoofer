import { generatePresetsSet1 } from "./1.js"; // done - 15
import { generatePresetsSet2 } from "./2.js"; // done - 15
import { generatePresetsSet3 } from "./3.js"; // done - 15
import { generatePresetsSet4 } from "./4.js"; // done - 15
import { generatePresetsSet5 } from "./5.js"; // done - 10
import { generatePresetsSet6 } from "./6.js"; // done - 10
import { generatePresetsSet7 } from "./7.js"; // done - 10
import { generatePresetsSet8 } from "./8.js"; // done - 10

let idCounter = 1;

const buildSet = (generator) => {
  const presets = generator(idCounter);
  idCounter += presets.length;
  return presets;
};

export const PRESETS = [
  ...buildSet(generatePresetsSet1),
  ...buildSet(generatePresetsSet2),
  ...buildSet(generatePresetsSet3),
  ...buildSet(generatePresetsSet4),
  ...buildSet(generatePresetsSet5),
  ...buildSet(generatePresetsSet6),
  ...buildSet(generatePresetsSet7),
  ...buildSet(generatePresetsSet8),
];
