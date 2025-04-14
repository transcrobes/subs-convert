import { secondsToMicroseconds } from "../shared/utils";
import { SubtitleEntry } from "../shared/types";

/**
 * Shift subtitle timecode based on seconds value passed in
 * @param data Subtitle entries to process
 * @param shiftAmountInSeconds Positive value adds time, negative values removes time
 * @returns Shifted subtitle entries
 */
function shiftTimecodeBySeconds(data: SubtitleEntry[], shiftAmountInSeconds: number): SubtitleEntry[] {
  const shiftAmountInMicroSeconds = secondsToMicroseconds(shiftAmountInSeconds);
  return data.map((line) => {
    line.startMicro += shiftAmountInMicroSeconds;
    line.endMicro += shiftAmountInMicroSeconds;
    if (line.startMicro < 0 || line.endMicro < 0) throw Error(`shift by ${shiftAmountInSeconds} failed`);
    return line;
  });
}

export default shiftTimecodeBySeconds;
