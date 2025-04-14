import { SubtitleEntry } from "../shared/types";

/**
 * Shift subtitle timecode based on fps value
 * @param data Subtitle entries to process
 * @param sourceFps Source frames per second
 * @param outputFps Output frames per second
 * @returns Shifted subtitle entries
 */
function shiftTimecodeByFps(data: SubtitleEntry[], sourceFps: number, outputFps: number): SubtitleEntry[] {
  const shiftAmount = sourceFps / outputFps;
  return data.map((line) => {
    line.startMicro *= shiftAmount;
    line.endMicro *= shiftAmount;
    return line;
  });
}

export default shiftTimecodeByFps;
