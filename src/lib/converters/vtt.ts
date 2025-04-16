import { compileWebVTT } from "../webvtt";
import { microsecondsToSeconds } from "../shared/utils";
import { SubtitleJSON, ParsedResult } from "../shared/types";

function format(subtitleJSON: SubtitleJSON): ParsedResult {
  return {
    valid: true,
    strict: false,
    errors: [],
    cues: subtitleJSON.body.map((line) => {
      const styles = line.styles
        ? Object.keys(line.styles)
            .map((key) => `${key}:${line.styles?.[key]}`)
            .join(" ")
        : "";
      return {
        identifier: line.id || "",
        start: microsecondsToSeconds(line.startMicro),
        end: microsecondsToSeconds(line.endMicro),
        text: line.text,
        styles,
      };
    }),
  };
}

function vtt(subtitleJSON: SubtitleJSON): string {
  const formattedJSON = format(subtitleJSON);
  return compileWebVTT(formattedJSON);
}

export default vtt;
