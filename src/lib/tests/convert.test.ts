import { describe, it, expect } from "vitest";
import { convert } from "@lib/converters";
import { fromSrt } from "../subtitles-parser";
import { head, pipe, split } from "ramda";

// Import mocks with proper paths and file extensions
import { badTextMultipleReturns } from "@lib/tests/mocks/badTextMultipleReturns.ts";
import { badIndexSequence } from "@lib/tests/mocks/badIndexSequence.ts";
import { badIndexNotNumerical } from "@lib/tests/mocks/badIndexNotNumerical.ts";
import { badTimecodeOverlap } from "@lib/tests/mocks/badTimecodeOverlap.ts";
import { badTimecodeStartsAtZero } from "@lib/tests/mocks/badTimecodeStartsAtZero.ts";
import { goodSRT } from "@lib/tests/mocks/goodSRT.ts";
import { goodASS } from "@lib/tests/mocks/goodASS.ts";
import { badASSkeys } from "@lib/tests/mocks/badASSkeys.ts";

describe("convert", () => {
  it("should remove multiple returns on a line", () => {
    expect(badTextMultipleReturns.match(/\n\n+/g)).not.toBeNull();
    const { subtitle, status } = convert(badTextMultipleReturns, ".srt");
    expect(subtitle.match(/\n\n+/g)).toBeNull();
    expect(status.success).toBe(true);
  });

  // INDEX
  it("should resequence indices", () => {
    const { subtitle } = convert(badIndexSequence, ".srt");
    const parsed = fromSrt(subtitle, true);
    expect(parsed[0].text).toBe("Beijing, hazy sky");

    // Handle all Unicode apostrophe variations
    expect(parsed[1].text).toBe("Can’t see original dreams");
  });

  it("should catch non numerical indices", () => {
    const { status } = convert(badIndexNotNumerical, ".srt");
    expect(status.success).toBe(false);
    expect(status.invalidIndices).toBeDefined();
    expect(status.invalidIndices?.length).toBeGreaterThan(0);
  });

  // TIMECODE
  it("should shift timecode by seconds", () => {
    const initial = fromSrt(goodSRT.toString(), true);
    expect(initial[0].startTime).toBe(5446);
    expect(initial[0].endTime).toBe(10817);

    const { subtitle } = convert(goodSRT, ".srt", { shiftTimecode: 3 });
    const parsed = fromSrt(subtitle, true);

    expect(parsed[0].startTime).toBe(8446);
    expect(parsed[0].endTime).toBe(13817);
  });

  it("should shift timecode by fps", () => {
    const initial = fromSrt(goodSRT.toString(), true);
    expect(initial[0].startTime).toBe(5446);
    expect(initial[0].endTime).toBe(10817);

    const { subtitle } = convert(goodSRT, ".srt", { sourceFps: 30, outputFps: 24 });
    const parsed = fromSrt(subtitle, true);

    expect(parsed[0].startTime).toBe(6807);
    expect(parsed[0].endTime).toBe(13521);
  });

  it("should fix timecode overlap", () => {
    const { status } = convert(badTimecodeOverlap, ".srt", { timecodeOverlapLimiter: 1 });
    expect(status.timecodeIssues?.overlappingTimecodes).toEqual([]);
  });

  it("should combine overlapping timecodes", () => {
    const { status } = convert(badTimecodeOverlap, ".srt", { combineOverlapping: true });
    expect(status.timecodeIssues?.overlappingTimecodes).toEqual([]);
  });

  it("should start timecode at zero hour", () => {
    const { status } = convert(badTimecodeStartsAtZero, ".srt", { startAtZeroHour: true });
    expect(status.startsAtZeroHour).toBe(true);
  });

  // Add remaining tests...
});

describe("ASS", () => {
  it("should throw an error when it cannot parse the keys", () => {
    expect(() => convert(badASSkeys, ".ass")).toThrow("Failed to parse keys in .ass file");
  });

  it("should have a first entry with index 1", () => {
    const { subtitle } = convert(goodASS, ".srt");
    const firstEntry = pipe(split(/(?:\r\n|\r|\n)/gm), head);
    expect(firstEntry(subtitle)).toBe("1");
  });
});
