import { SubtitleEntry } from "../shared/types";
import { timecodeToMicroseconds, microsecondsToSrtTimestamp } from "../shared/utils";

/**
 * Modern TypeScript implementation of subtitles-parser
 * Original: https://github.com/bazh/subtitles-parser
 * Converted from the original JavaScript implementation to TypeScript
 */

/**
 * Converts SubRip subtitles into array of SubtitleEntry objects (using microseconds)
 * @param  {string}  data - SubRip subtitles string
 * @return {SubtitleEntry[]} - Array of subtitle entries
 */
export function fromSrt(data: string): SubtitleEntry[] {
  // Replace carriage returns with empty string
  data = data.replace(/\r/g, "");

  // Regular expression to match SRT format
  const regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;

  // Split the data by regex
  const parts = data.split(regex);

  // Remove the first empty element
  parts.shift();

  const items: SubtitleEntry[] = [];

  // Process parts in groups of 4: id, start, end, text
  for (let i = 0; i < parts.length; i += 4) {
    items.push({
      id: parts[i].trim(),
      startMicro: timecodeToMicroseconds(parts[i + 1].trim()),
      endMicro: timecodeToMicroseconds(parts[i + 2].trim()),
      text: parts[i + 3].trim(),
    });
  }

  return items;
}

/**
 * Converts Array of SubtitleEntry objects to SubRip subtitles format
 * @param  {SubtitleEntry[]}  data - Array of subtitle entries
 * @return {string} - SubRip subtitles string
 */
export function toSrt(data: SubtitleEntry[]): string {
  if (!Array.isArray(data)) return "";

  let result = "";

  for (const subtitle of data) {
    const startTime = microsecondsToSrtTimestamp(subtitle.startMicro);
    const endTime = microsecondsToSrtTimestamp(subtitle.endMicro);
    result += subtitle.id + "\r\n";
    result += startTime + " --> " + endTime + "\r\n";
    result += subtitle.text.replace("\n", "\r\n") + "\r\n\r\n";
  }

  return result;
}
