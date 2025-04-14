import { toSrt } from "../subtitles-parser";
import { SubtitleJSON } from "../shared/types";
import { microsecondsToMilliseconds } from "../shared/utils";

interface SrtEntry {
  id: string;
  startTime: number;
  endTime: number;
  text: string;
}

function format(subtitleJSON: SubtitleJSON): SrtEntry[] {
  return subtitleJSON.body.map((line) => ({
    id: line.id,
    startTime: microsecondsToMilliseconds(line.startMicro),
    endTime: microsecondsToMilliseconds(line.endMicro),
    text: line.text,
  }));
}

function srt(subtitleJSON: SubtitleJSON): string {
  const formattedJSON = format(subtitleJSON);
  return toSrt(formattedJSON);
}

export default srt;
