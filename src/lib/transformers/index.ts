import combineTimecodeOverlap from "./combine_timecode_overlap";
import fixTimecodeOverlap from "./fix_timecode_overlap";
import shiftTimecodeByFps from "./fps_standard_conversion";
import shiftTimecodeBySeconds from "./shift_subtitle_timecode";
import shiftToZeroHour from "./shift_to_zero_hour";
import { SubtitleEntry, SubtitleOptions } from "../shared/types";

 
function transform(data: SubtitleEntry[], options: SubtitleOptions): SubtitleEntry[] {
  const { timecodeOverlapLimiter, combineOverlapping, shiftTimecode, sourceFps, outputFps, startAtZeroHour } = options;
  let result = data;

  if (timecodeOverlapLimiter !== false) {
    // can pass in 0 to see if there is any overlap
    result = fixTimecodeOverlap(result, timecodeOverlapLimiter as number | undefined);
  }
  if (combineOverlapping) {
    result = combineTimecodeOverlap(result);
  }
  if (shiftTimecode) {
    result = shiftTimecodeBySeconds(result, shiftTimecode);
  }
  if (sourceFps && outputFps) {
    result = shiftTimecodeByFps(result, sourceFps, outputFps);
  }
  if (startAtZeroHour) {
    result = shiftToZeroHour(result);
  }
  return result;
}

export default transform;
