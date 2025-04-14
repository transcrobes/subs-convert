import { timecodeToMicroseconds } from "../shared/utils";
import {
  potentialIndexRegex,
  potentialTimecodeRegex,
  potentialSrtBlockRegex,
  untilFirstTimecodeRegex,
  validTimecodeRegex,
  noTextEntryRegex,
  validEntryRegexGroups,
  strictTimestampRegex,
} from "./srtEntriesRegex";

interface SrtEntryOptions {
  invalidEntries?: boolean;
  invalidTimecodes?: boolean;
  invalidIndices?: boolean;
}

interface InvalidEntry {
  id?: string;
  timecode?: string;
  text?: string;
}

interface ParseStatus {
  success: boolean;
  invalidEntries: InvalidEntry[];
  invalidTimecodes: InvalidEntry[];
  invalidIndices: { id?: string }[];
}

interface ValidEntry {
  id: string;
  timecode: string;
  startMicro: number;
  endMicro: number;
  text: string;
}

interface ParseResult {
  validEntries: ValidEntry[];
  status: ParseStatus;
}

interface Accumulator extends ParseResult {
  currentIndex: number;
}

/**
 * Functions for parseSrtEntries
 */
function standardizeTimestamp(timestamp: string): string {
  if (strictTimestampRegex.test(timestamp)) return timestamp;
  return timestamp.replace(/[^\d]+/g, ":").replace(/:(?=\d{3})/, ","); // HH:MM:SS,mmm format
}

function pushInvalidEntry(
  acc: Accumulator,
  cur: string,
  options: SrtEntryOptions,
  invalidTimecodeFound: boolean,
  invalidIndexFound: boolean,
): Accumulator {
  acc.status.success = false;

  const idMatch = cur.match(potentialIndexRegex);
  const id = idMatch ? idMatch[0] : undefined;
  const timecodeMatch = cur.match(potentialTimecodeRegex);
  const timecode = timecodeMatch ? timecodeMatch[0] : undefined;
  const text = timecodeMatch ? cur.split(potentialTimecodeRegex)[1] : undefined; // Split with timecode, 0 position will be the 'id' or empty string
  const invalidEntry: InvalidEntry = { id, timecode, text };

  if (options.invalidEntries) acc.status.invalidEntries.push(invalidEntry);
  if (options.invalidIndices && invalidIndexFound) acc.status.invalidIndices.push({ id });
  if (options.invalidTimecodes && invalidTimecodeFound) acc.status.invalidTimecodes.push({ id, timecode });
  return acc;
}

function pushValidEntry(acc: Accumulator, cur: string): Accumulator {
  // Capturing groups indicated in srtEntriesRegex.ts
  const entryGroups = cur.match(validEntryRegexGroups);
  if (!entryGroups) return acc;

  const start = standardizeTimestamp(entryGroups[1]);
  const end = standardizeTimestamp(entryGroups[2]);
  const text = entryGroups[3];

  acc.validEntries.push({
    id: acc.currentIndex.toString(),
    timecode: `${start} --> ${end}`,
    startMicro: timecodeToMicroseconds(start),
    endMicro: timecodeToMicroseconds(end),
    text,
  });
  acc.currentIndex += 1;
  return acc;
}

/**
 * Main function of srtEntries.ts
 */
function parseSrtEntries(
  subtitleText: string,
  options: SrtEntryOptions = {
    invalidEntries: true,
    invalidTimecodes: true,
    invalidIndices: true,
  },
): ParseResult {
  // Initializing result object
  const result: ParseResult = {
    validEntries: [],
    status: {
      success: true,
      invalidEntries: [],
      invalidTimecodes: [],
      invalidIndices: [],
    },
  };

  // Standardizing line breaks from all OS - MAC: '\r', UNIX: '\n', WIN '\r\n'
  subtitleText = subtitleText.replace(/(\r\n|\r)/g, "\n");

  // Creating an array with all potential entries
  const potentialBlocksArray = subtitleText.match(potentialSrtBlockRegex);
  if (!potentialBlocksArray) {
    result.validEntries = [] as any; // Cast to any to match original logic
    result.status.success = false;
    return result;
  }

  // Only potential index, whitespace or empty string allowed until first timecode
  const untilFirstTimecodeMatch = subtitleText.match(untilFirstTimecodeRegex);
  const untilFirstTimecode = untilFirstTimecodeMatch ? untilFirstTimecodeMatch[0] : "";
  const invalidFirstEntryFound = !/^(\n*(.+\n)?|0)$/.test(untilFirstTimecode);
  if (invalidFirstEntryFound) {
    result.status.success = false;
    result.status.invalidEntries.push({
      id: "0",
      timecode: "00:00:00:000",
      text: untilFirstTimecode,
    });
  }

  // Validating all entries and creating return objects
  const initialAccumulator: Accumulator = { currentIndex: 1, ...result };
  const { validEntries, status } = potentialBlocksArray.reduce((acc, cur) => {
    cur = cur.replace(/\n{2,}/g, "\n").trim(); // Remove excessive whitespace

    const potentialIndex = cur.match(potentialIndexRegex);
    const invalidIndexFound = potentialIndex ? !/^\d+$/.test(potentialIndex[0]) : false;
    const invalidTimecodeFound = !cur.match(validTimecodeRegex);

    if (invalidTimecodeFound || invalidIndexFound) {
      return pushInvalidEntry(acc, cur, options, invalidTimecodeFound, invalidIndexFound);
    }

    if (noTextEntryRegex.test(cur)) return acc;

    return pushValidEntry(acc, cur);
  }, initialAccumulator);

  return { validEntries, status };
}

export default parseSrtEntries;
