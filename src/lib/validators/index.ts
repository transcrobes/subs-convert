import { isEmpty } from "ramda";
import { parse } from "../parsers";
import { ParseExtension, SubtitleOptions, ValidationOptions, ValidationStatus } from "../shared/types";
import { getExtension } from "../shared/utils";
import validateStandardized from "./standardizedJSON";

export function validate(
  subtitleText: string,
  inputExtension?: ParseExtension,
  options: SubtitleOptions & ValidationOptions = {},
): ValidationStatus {
  // read inputFile, convert to standardized JSON format
  const extension = getExtension(subtitleText) || inputExtension;

  if (!extension) {
    throw Error("Could not determine subtitle format");
  }

  const { data, status: parseStatus } = parse(subtitleText, extension, options);

  if (isEmpty(data.body)) throw Error("Parsed file is empty");

  const outputStatus = validateStandardized(data.body, options);

  const success = parseStatus.success && outputStatus.success;
  const status = { ...parseStatus, ...outputStatus, success };
  return status;
}
