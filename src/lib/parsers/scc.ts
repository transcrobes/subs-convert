import { SUBTITLE_SCHEMA } from "../shared/constants";
import { ParseResult, SubtitleJSON, SubtitleOptions, ValidationStatus } from "../shared/types";
import { cleanUpText } from "../shared/utils";
import { toJSON, type SCCJsonCaption } from "./scc_to_json";

function standardize(subtitleJSON: SCCJsonCaption[], options: SubtitleOptions = {}): SubtitleJSON {
  const { removeTextFormatting = false } = options;
  return {
    global: {},
    body: subtitleJSON
      .map((line, index) => ({
        id: (index + 1).toString(),
        startMicro: line.startTimeMicro,
        // Ensure endMicro is always a number (default to startTimeMicro if undefined)
        endMicro: line.endTimeMicro ?? line.startTimeMicro,
        captions: {
          frames: line.frames,
          popOn: line.popOn,
          paintOn: line.paintOn,
          rollUpRows: line.rollUpRows,
          commands: line.commands,
        },
        text: cleanUpText(line.text, removeTextFormatting),
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

function scc(subtitleText: string, options: SubtitleOptions = {}): ParseResult {
  const status: ValidationStatus = {
    success: true,
    invalidEntries: [],
    invalidTimecodes: [],
    invalidIndices: [],
  };
  const lines = subtitleText.split(/\r\n|\n|\r/);
  const subtitleJSON = toJSON(lines);
  const { error, value } = SUBTITLE_SCHEMA.validate(standardize(subtitleJSON, options), { abortEarly: false });
  if (error) {
    throw new Error(error.details.map((d) => d.message).join(", "));
  }

  if (status.invalidEntries && status.invalidEntries.length) status.success = false;
  return { data: value, status };
}

export default scc;
