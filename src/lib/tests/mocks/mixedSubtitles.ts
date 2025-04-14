import { goodSRT } from "./goodSRT";
import { goodTTML } from "./goodTTML";
import { goodSCC } from "./goodSCC";
import { goodVTT } from "./goodVTT";
import { goodVTT as goodVTT2 } from "./goodVTT2";
import { goodDFXP } from "./goodDFXP";
import { goodASS } from "./goodASS";
import { goodSRT as goodSRTTextWithNums } from "./goodSRTTextWithNums";

export const mixedSubtitles = [
  {
    type: ".srt",
    subtitleText: goodSRT,
  },
  {
    type: ".srt",
    subtitleText: goodSRTTextWithNums,
  },
  {
    type: ".ttml",
    subtitleText: goodTTML,
  },
  {
    type: ".scc",
    subtitleText: goodSCC,
  },
  {
    type: ".vtt",
    subtitleText: goodVTT,
  },
  {
    type: ".vtt",
    subtitleText: goodVTT2,
  },
  {
    type: ".ttml",
    subtitleText: goodDFXP,
  },
  {
    type: ".ass",
    subtitleText: "[Script Info]",
  },
  {
    type: ".ass",
    subtitleText: goodASS,
  },
  {
    type: ".srt",
    subtitleText: `
    Hello-->.
    `,
  },
  {
    type: undefined,
    subtitleText: `
    Lorem Ipsum is simply dummy text
    of the printing and typesetting
    industry. Lorem Ipsum has been
    the industry's standard dummy
    text ever since the 1500.
    `,
  },
];
