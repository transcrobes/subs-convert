import { VALID_EXT_REGEX_ARRAY } from "./extensionRegex";

export function microsecondsToMilliseconds(microseconds: number): number {
  return microseconds / 1000;
}

export function microsecondsToSeconds(microseconds: number): number {
  return microsecondsToMilliseconds(microseconds / 1000);
}

export function millisecondsToMicroseconds(milliseconds: number): number {
  return milliseconds * 1000;
}

export function secondsToMicroseconds(seconds: number): number {
  return millisecondsToMicroseconds(seconds * 1000);
}

export function minutesToMicroseconds(minutes: number): number {
  return secondsToMicroseconds(minutes * 60);
}

export function hoursToMicroseconds(hours: number): number {
  return minutesToMicroseconds(hours * 60);
}

export function framesToMicroseconds(frames: number, fps: number): number {
  if (!frames || !fps) {
    return 0;
  }
  const seconds = frames / fps;
  return secondsToMicroseconds(seconds);
}

export function timecodeToMicroseconds(timecode: string, fps?: number): number {
  if (!timecode) {
    return 0;
  }

  const parts = timecode.replace(",", ".").split(":");
  let hours = "0",
    minutes = "0",
    secondsAndMilliseconds = "0",
    other = "";

  // Handle different timecode formats (ASS format has fewer parts)
  if (parts.length === 4) {
    [hours, minutes, secondsAndMilliseconds, other] = parts;
  } else if (parts.length === 3) {
    [hours, minutes, secondsAndMilliseconds] = parts;
  } else if (parts.length === 2) {
    [minutes, secondsAndMilliseconds] = parts;
  } else if (parts.length === 1) {
    [secondsAndMilliseconds] = parts;
  }

  const secAndMilliParts = secondsAndMilliseconds.split(".");
  const seconds = secAndMilliParts[0] || "0";
  const milliseconds = secAndMilliParts[1] || "0";

  const secAndFramesParts = seconds.split(";");
  const frames = secAndFramesParts[1] || other;

  if (frames && !fps) {
    throw Error(`Timecode (${timecode}) contains frames, but no fps was specified.`);
  }

  return (
    hoursToMicroseconds(parseInt(hours, 10)) +
    minutesToMicroseconds(parseInt(minutes, 10)) +
    secondsToMicroseconds(parseInt(seconds, 10)) +
    millisecondsToMicroseconds(parseInt(milliseconds, 10)) +
    framesToMicroseconds(parseInt(frames || "0", 10), parseFloat(fps?.toString() || "0"))
  );
}

/**
 * Converts microseconds to SRT time format (00:00:00,000)
 * @param microseconds - Time in microseconds
 * @return {string} - Time in SRT format
 */
export function microsecondsToSrtTimestamp(microseconds: number): string {
  const totalMilliseconds = Math.floor(microseconds / 1000);
  const ms = totalMilliseconds % 1000;
  const totalSeconds = Math.floor(totalMilliseconds / 1000);
  const s = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const m = totalMinutes % 60;
  const h = Math.floor(totalMinutes / 60);
  return (
    h.toString().padStart(2, "0") +
    ":" +
    m.toString().padStart(2, "0") +
    ":" +
    s.toString().padStart(2, "0") +
    "," +
    ms.toString().padStart(3, "0")
  );
}

export function extractStyling(text: string): string {
  const regexReplace = [
    { regex: /^<br>/m, value: "" }, // remove <br> from beginning of every line
    { regex: /<br>/g, value: "\n" }, // replace all other <br> with new line
    { regex: /<.*?>/g, value: "" }, // remove all <...> tags
    { regex: /{.*?}/g, value: " " }, // replace all '{...}' with a white space
    { regex: /(>|<|{|})/g, value: "" }, // remove all remaining '<', '>', '{', '}' characters
    { regex: / {2,}/g, value: " " }, // replace all 2+ length white space with a single whitespace
    { regex: /^\s+|\s+$/gm, value: "" }, // trim every line
  ];
  return regexReplace.reduce((newText, { regex, value }) => newText.replace(regex, value), text);
}

export function cleanUpText(text: string | undefined, removeTextFormatting = false): string {
  if (!text) return "";

  let newText = text.replace(/[\n]+/g, "\n").trim();
  if (removeTextFormatting) {
    newText = extractStyling(newText);
  }
  return newText;
}

/**
 * Checks if input file is potentially any of the following
 * subitle files: .srt, .vtt, .scc, .ttml(same as .dfxp).
 * @param subtitle The utf-8 string content of any file type.
 * @return One of the extensions from description or undefined
 */
export function getExtension(subtitle: string): string | undefined {
  let result: string | undefined;

  VALID_EXT_REGEX_ARRAY.some((extension) => {
    if (extension.regex.test(subtitle)) result = extension.extension;
    return !!result;
  });
  return result;
}
