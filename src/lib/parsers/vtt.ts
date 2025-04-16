import { SUBTITLE_SCHEMA } from "../shared/constants";
import { ParsedResult, ParseResult, SubtitleJSON, SubtitleOptions, ValidationStatus } from "../shared/types";
import { cleanUpText, secondsToMicroseconds } from "../shared/utils";
import { parse } from "../webvtt";

function standardize(subtitleJSON: ParsedResult, options: SubtitleOptions = {}): SubtitleJSON {
  const { removeTextFormatting = false } = options;
  return {
    global: {},
    body: subtitleJSON.cues
      .map((line, index: number) => {
        const styles = line.styles
          ? line.styles.split(" ").reduce((obj: Record<string, string>, style: string) => {
              const [key, value] = style.split(":");
              obj[key] = value;
              return obj;
            }, {})
          : {};

        return {
          id: index.toString(),
          startMicro: secondsToMicroseconds(line.start),
          endMicro: secondsToMicroseconds(line.end),
          styles,
          text: cleanUpText(line.text, removeTextFormatting),
        };
      })
      .filter((line) => line.text)
      .map((line, index) => {
        // if empty lines were deleted, we need to make sure the id is in sequential order
        line.id = (index + 1).toString();

        return line;
      }),
    source: subtitleJSON,
  };
}

function vtt(subtitleText: string, options: SubtitleOptions = {}): ParseResult {
  const status: ValidationStatus = {
    success: true,
    invalidEntries: [],
    invalidTimecodes: [],
    invalidIndices: [],
  };
  const subtitleJSON = parse(subtitleText, { meta: true });
  const { error, value } = SUBTITLE_SCHEMA.validate(standardize(subtitleJSON, options), { abortEarly: false });
  if (error) {
    throw new Error(error.details.map((d) => d.message).join(", "));
  }

  if (status.invalidEntries && status.invalidEntries.length) status.success = false;
  return { data: value, status };
}

export default vtt;
