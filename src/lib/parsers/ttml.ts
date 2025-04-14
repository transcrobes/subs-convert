import * as R from "ramda";
import { Parser } from "xml2js";
import { SUBTITLE_SCHEMA } from "../shared/constants";
import { ParseResult, SubtitleJSON, SubtitleOptions, ValidationStatus } from "../shared/types";
import { cleanUpText, timecodeToMicroseconds } from "../shared/utils";

interface TTMLSubtitle {
  tt: {
    $: {
      "xml:lang"?: string;
      [key: string]: any;
    };
    body: [
      {
        div: [
          {
            p: Array<{
              $: {
                begin: string;
                end: string;
              };
              _: string;
            }>;
          },
        ];
      },
    ];
  };
}

function standardize(subtitleJSON: TTMLSubtitle, options: SubtitleOptions = {}): SubtitleJSON {
  const { removeTextFormatting = false } = options;
  const global = R.path(["tt", "$"], subtitleJSON);
  const body = R.path(["tt", "body", "0", "div", "0", "p"], subtitleJSON);
  return {
    global: {
      language: global["xml:lang"],
    },
    body: body
      .map((line, index) => ({
        id: index.toString(),
        startMicro: timecodeToMicroseconds(R.path(["$", "begin"], line)),
        endMicro: timecodeToMicroseconds(R.path(["$", "end"], line)),
        text: cleanUpText(line._, removeTextFormatting),
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

function ttml(subtitleText: string, options: SubtitleOptions = {}): ParseResult {
  const status: ValidationStatus = {
    success: true,
    invalidEntries: [],
    invalidTimecodes: [],
    invalidIndices: [],
  };
  const parser = new Parser({ async: false });

  let subtitleJSON: TTMLSubtitle | undefined;
  parser.parseString(subtitleText, (err: Error | null, result: TTMLSubtitle) => {
    if (err) {
      // Add required id field to the error entry
      status.invalidEntries!.push({
        id: "0", // Assign a default id for error entries
        text: err.message,
      });
    }
    subtitleJSON = result;
  });

  if (!subtitleJSON) {
    throw Error("Failed to parse TTML/DFXP subtitle");
  }

  const { error, value } = SUBTITLE_SCHEMA.validate(standardize(subtitleJSON, options), { abortEarly: false });
  if (error) {
    throw new Error(error.details.map((d) => d.message).join(", "));
  }

  if (status.invalidEntries && status.invalidEntries.length) status.success = false;
  return { data: value, status };
}

export default ttml;
