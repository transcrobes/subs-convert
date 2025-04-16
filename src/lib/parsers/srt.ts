import { SUBTITLE_SCHEMA } from "../shared/constants";
import { ParseResult, SubtitleJSON, SubtitleOptions, ValidationStatus, SubtitleEntry } from "../shared/types";
import { cleanUpText } from "../shared/utils";
import parseEntries from "./srtEntries";

function standardize(subtitleJSON: SubtitleEntry[], options: SubtitleOptions = {}): SubtitleJSON {
  const { removeTextFormatting = false } = options;
  return {
    global: {},
    body: subtitleJSON
      .map((line) => ({
        id: line.id,
        timecode: line.timecode ?? "",
        startMicro: line.startMicro,
        endMicro: line.endMicro,
        text: cleanUpText(line.text, removeTextFormatting).normalize("NFKC"),
      }))
      .filter((line) => line.text)
      .map((line, index) => {
        // if empty lines were deleted, we need to make sure the id is in sequential order
        line.id = (index + 1).toString();
        return line;
      }),
    source: subtitleJSON,
  };
}

function srt(subtitleText: string, options: SubtitleOptions = {}): ParseResult {
  const { data, status } = parseEntries(subtitleText);

  const { error, value } = SUBTITLE_SCHEMA.validate(standardize(data.body, options), { abortEarly: false });
  if (error) {
    throw new Error(error.details.map((d) => d.message).join(", "));
  }
  return { data: value, status: status as ValidationStatus };
}

export default srt;
