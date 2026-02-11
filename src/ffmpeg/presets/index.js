import { generatePresetsSet1 } from "./1.js";
import { generatePresetsSet2 } from "./2.js";
import { generatePresetsSet3 } from "./3.js";
import { generatePresetsSet4 } from "./4.js";
import { generatePresetsSet5 } from "./5.js";

export const PRESETS = [
  ...generatePresetsSet1(1),
  ...generatePresetsSet2(31),
  ...generatePresetsSet3(41),
  ...generatePresetsSet4(61),
  ...generatePresetsSet5(81),
];
