import { last, update, assoc } from "ramda";
import { SubtitleEntry } from "../shared/types";

function combineTimecodeOverlap(data: SubtitleEntry[]): SubtitleEntry[] {
  if (!data.length) return data;

  // combine text with newline character
  // if previous and next timecodes overlap
  const combinedData = data.reduce<SubtitleEntry[]>((acc, next) => {
    const prev = last(acc) || ({} as SubtitleEntry);

    if (next.startMicro < prev.endMicro) {
      const combined: SubtitleEntry = {
        ...next,
        id: prev.id,
        startMicro: prev.startMicro,
        endMicro: next.endMicro,
        text: `${prev.text}\n${next.text}`,
      };
      return update(-1, combined, acc);
    }

    return acc.concat(next);
  }, []);

  // reset index values
  return combinedData.map((entry, index) => assoc("id", (index + 1).toString(), entry));
}

export default combineTimecodeOverlap;
