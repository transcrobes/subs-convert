import { isEmpty } from "ramda";
import parse from "../parsers";
import { PARAM_SCHEMA } from "../shared/constants";
import { ConversionResult, ExportExtension, SubtitleJSON, SubtitleOptions, ValidationOptions } from "../shared/types";
import { getExtension } from "../shared/utils";
import transform from "../transformers";
import validateStandardized from "../validators/standardizedJSON";
import srt from "./srt";
import vtt from "./vtt";

function generateOutputData(jsonData: SubtitleJSON, outputExtension: ExportExtension): string {
  switch (outputExtension) {
    case ".srt":
      return srt(jsonData);
    case ".vtt":
      return vtt(jsonData);
    default:
      throw Error(`File type ${outputExtension} is not supported. Supported output file types include: '.srt', '.vtt'`);
  }
}

export function convert(
  subtitleText: string,
  outputExtension: ExportExtension,
  options: SubtitleOptions = {
    // set default options
    timecodeOverlapLimiter: false,
  },
): ConversionResult {
  // validate input options
  const { error: validationError } = PARAM_SCHEMA.validate(
    {
      subtitleText,
      outputExtension,
      options,
    },
    { abortEarly: false },
  );

  if (validationError) throw new Error(validationError.details.map((d) => d.message).join(", "));

  const extension = getExtension(subtitleText);
  if (!extension) {
    throw Error("Could not determine subtitle format");
  }

  // read inputFile, convert to standardized JSON format
  const { data, status: parseStatus } = parse(subtitleText, extension, options);

  if (isEmpty(data.body)) throw new Error("Parsed file is empty");

  // run optional transformations
  const result = transform(data.body, options);

  // add validation options
  const validationOptions: ValidationOptions = {
    startsAtZeroHour: options.startAtZeroHour,
    reversedTimecodes: true,
    overlappingTimecodes: true,
    formattedText: options.removeTextFormatting,
  };
  const outputStatus = validateStandardized(result, validationOptions);

  data.body = result;
  // generate output data according to output extension
  const subtitle = generateOutputData(data, outputExtension);

  const status = { ...parseStatus, ...outputStatus, success: parseStatus.success && outputStatus.success };
  return { subtitle, status };
}
