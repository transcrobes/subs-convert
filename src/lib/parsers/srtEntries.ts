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
import { ParseResult, SrtEntryOptions, SrtAccumulator, ValidationIssue } from "../shared/types";

function standardizeTimestamp(timestamp: string): string {
  if (strictTimestampRegex.test(timestamp)) return timestamp;
  return timestamp.replace(/[^\d]+/g, ":").replace(/:(?=\d{3})/, ","); // HH:MM:SS,mmm format
}

function pushInvalidEntry(
  acc: SrtAccumulator,
  cur: string,
  options: SrtEntryOptions,
  invalidTimecodeFound: boolean,
  invalidIndexFound: boolean,
): SrtAccumulator {
  acc.status.success = false;

  const idMatch = cur.match(potentialIndexRegex);
  const id = idMatch ? idMatch[0] : "";
  const timecodeMatch = cur.match(potentialTimecodeRegex);
  const timecode = timecodeMatch ? timecodeMatch[0] : undefined;
  const text = timecodeMatch ? cur.split(potentialTimecodeRegex)[1] : undefined;
  const invalidEntry: ValidationIssue = { id, timecode, text };

  if (options.invalidEntries) acc.status.invalidEntries?.push(invalidEntry);
  if (options.invalidIndices && invalidIndexFound) acc.status.invalidIndices?.push({ id });
  if (options.invalidTimecodes && invalidTimecodeFound) acc.status.invalidTimecodes?.push({ id, timecode });
  return acc;
}

function pushValidEntry(acc: SrtAccumulator, cur: string): SrtAccumulator {
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

function parseSrtEntries(
  subtitleText: string,
  options: SrtEntryOptions = {
    invalidEntries: true,
    invalidTimecodes: true,
    invalidIndices: true,
  },
): ParseResult {
  const result: SrtAccumulator = {
    currentIndex: 1,
    validEntries: [],
    status: {
      success: true,
      invalidEntries: [],
      invalidTimecodes: [],
      invalidIndices: [],
    },
  };

  subtitleText = subtitleText.replace(/(\r\n|\r)/g, "\n");
  const potentialBlocksArray = subtitleText.match(potentialSrtBlockRegex);
  if (!potentialBlocksArray) {
    result.validEntries = [];
    result.status.success = false;
    return { data: { global: {}, body: [], source: [] }, status: result.status };
  }

  const untilFirstTimecodeMatch = subtitleText.match(untilFirstTimecodeRegex);
  const untilFirstTimecode = untilFirstTimecodeMatch ? untilFirstTimecodeMatch[0] : "";
  const invalidFirstEntryFound = !/^(\n*(.+\n)?|0)$/.test(untilFirstTimecode);
  if (invalidFirstEntryFound) {
    result.status.success = false;
    result.status.invalidEntries?.push({
      id: "0",
      timecode: "00:00:00:000",
      text: untilFirstTimecode,
    });
  }

  const finalAccumulator = potentialBlocksArray.reduce((acc, cur) => {
    cur = cur.replace(/\n{2,}/g, "\n").trim();
    const potentialIndex = cur.match(potentialIndexRegex);
    const invalidIndexFound = potentialIndex ? !/^\d+$/.test(potentialIndex[0]) : false;
    const invalidTimecodeFound = !cur.match(validTimecodeRegex);
    if (invalidTimecodeFound || invalidIndexFound) {
      return pushInvalidEntry(acc, cur, options, invalidTimecodeFound, invalidIndexFound);
    }
    if (noTextEntryRegex.test(cur)) return acc;
    return pushValidEntry(acc, cur);
  }, result);

  return {
    data: { global: {}, body: finalAccumulator.validEntries, source: [] },
    status: finalAccumulator.status,
  };
}

export default parseSrtEntries;
