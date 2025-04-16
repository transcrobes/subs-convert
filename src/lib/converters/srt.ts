import { toSrt } from "../subtitles-parser";
import { SubtitleJSON, SubtitleEntry } from "../shared/types";

function format(subtitleJSON: SubtitleJSON): SubtitleEntry[] {
  return subtitleJSON.body.map((line) => ({
    ...line,
  }));
}

function srt(subtitleJSON: SubtitleJSON): string {
  const formattedJSON = format(subtitleJSON);
  return toSrt(formattedJSON);
}

export default srt;
