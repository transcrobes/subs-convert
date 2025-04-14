/**
 * Modern TypeScript implementation of subtitles-parser
 * Original: https://github.com/bazh/subtitles-parser
 * Converted from the original JavaScript implementation to TypeScript
 */

/**
 * Interface representing a subtitle entry
 */
export interface SubtitleEntry {
  id: string;
  startTime: string | number; // Can be timestamp (00:00:00,000) or milliseconds (number)
  endTime: string | number; // Can be timestamp (00:00:00,000) or milliseconds (number)
  text: string;
}

/**
 * Converts SubRip subtitles into array of objects
 * @param  {string}  data - SubRip subtitles string
 * @param  {boolean} [ms] - Optional: use milliseconds for startTime and endTime
 * @return {SubtitleEntry[]} - Array of subtitle entries
 */
export function fromSrt(data: string, ms?: boolean): SubtitleEntry[] {
  const useMs = ms ? true : false;

  // Replace carriage returns with empty string
  data = data.replace(/\r/g, "");

  // Regular expression to match SRT format
  const regex = /(\d+)\n(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})/g;

  // Split the data by regex
  const parts = data.split(regex);

  // Remove the first empty element
  parts.shift();

  const items: SubtitleEntry[] = [];

  // Process parts in groups of 4: id, startTime, endTime, text
  for (let i = 0; i < parts.length; i += 4) {
    items.push({
      id: parts[i].trim(),
      startTime: useMs ? timeMs(parts[i + 1].trim()) : parts[i + 1].trim(),
      endTime: useMs ? timeMs(parts[i + 2].trim()) : parts[i + 2].trim(),
      text: parts[i + 3].trim(),
    });
  }

  return items;
}

/**
 * Converts Array of subtitle objects to SubRip subtitles format
 * @param  {SubtitleEntry[]}  data - Array of subtitle entries
 * @return {string} - SubRip subtitles string
 */
export function toSrt(data: SubtitleEntry[]): string {
  if (!Array.isArray(data)) return "";

  let result = "";

  for (const subtitle of data) {
    let startTime = subtitle.startTime;
    let endTime = subtitle.endTime;

    // Convert milliseconds to SRT time format if they are numbers
    if (!isNaN(Number(startTime)) && !isNaN(Number(endTime))) {
      startTime = msTime(parseInt(String(startTime), 10));
      endTime = msTime(parseInt(String(endTime), 10));
    }

    result += subtitle.id + "\r\n";
    result += startTime + " --> " + endTime + "\r\n";
    result += subtitle.text.replace("\n", "\r\n") + "\r\n\r\n";
  }

  return result;
}

/**
 * Converts SRT time format (00:00:00,000) to milliseconds
 * @param  {string} val - Time in SRT format
 * @return {number} - Time in milliseconds
 */
function timeMs(val: string): number {
  const regex = /(\d+):(\d{2}):(\d{2}),(\d{3})/;
  const parts = regex.exec(val);

  if (parts === null) {
    return 0;
  }

  // Convert all parts to integers
  const hours = parseInt(parts[1], 10) || 0;
  const minutes = parseInt(parts[2], 10) || 0;
  const seconds = parseInt(parts[3], 10) || 0;
  const milliseconds = parseInt(parts[4], 10) || 0;

  // Calculate total milliseconds
  return hours * 3600000 + minutes * 60000 + seconds * 1000 + milliseconds;
}

/**
 * Converts milliseconds to SRT time format (00:00:00,000)
 * @param  {number} val - Time in milliseconds
 * @return {string} - Time in SRT format
 */
function msTime(val: number): string {
  const measures = [3600000, 60000, 1000];
  const time: string[] = [];

  // Calculate hours, minutes, seconds
  for (const measure of measures) {
    const res = Math.floor(val / measure).toString();
    val %= measure;
    // Ensure two-digit format
    time.push(res.padStart(2, "0"));
  }

  // Format milliseconds
  let ms = val.toString();
  // Ensure three-digit format for milliseconds
  ms = ms.padStart(3, "0");

  return time.join(":") + "," + ms;
}
