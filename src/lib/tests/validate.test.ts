import { describe, it, expect } from "vitest";
import { validate } from "@lib/validators";

// Import mocks with proper paths and file extensions
import { goodSRT } from "@lib/tests/mocks/goodSRT.ts";
import { goodSCC } from "@lib/tests/mocks/goodSCC.ts";
import { goodVTT } from "@lib/tests/mocks/goodVTT.ts";
import { goodDFXP } from "@lib/tests/mocks/goodDFXP.ts";
import { goodTTML } from "@lib/tests/mocks/goodTTML.ts";
import { badTimecodeReversed } from "@lib/tests/mocks/badTimecodeReversed.ts";
import { badTimecodeOverlap } from "@lib/tests/mocks/badTimecodeOverlap.ts";
import { badTextFormatted } from "@lib/tests/mocks/badTextFormatted.ts";
import { badAllEmpty } from "@lib/tests/mocks/badAllEmpty.ts";

describe("#validate", () => {
  it("should validate srt files", () => {
    const status = validate(goodSRT, ".srt");
    expect(status.success).toBe(true);
  });

  it("should show reversed timecodes", () => {
    const status = validate(badTimecodeReversed, ".srt", { reversedTimecodes: true });
    expect(status.success).toBe(false);
    expect(status.timecodeIssues?.reversedTimecodes).toBeDefined();
    expect(status.timecodeIssues?.reversedTimecodes?.length).toBeGreaterThan(0);
  });

  it("should show overlapping timecodes", () => {
    const status = validate(badTimecodeOverlap, ".srt", { overlappingTimecodes: true });
    expect(status.success).toBe(false);
    expect(status.timecodeIssues?.overlappingTimecodes).toBeDefined();
    expect(status.timecodeIssues?.overlappingTimecodes?.length).toBeGreaterThan(0);
  });

  it("should show formatted text", () => {
    const status = validate(badTextFormatted, ".srt", { formattedText: true });
    expect(status.success).toBe(false);
    expect(status.formattedText).toBeDefined();
    expect(status.formattedText?.length).toBeGreaterThan(0);
  });

  it("should validate scc files", () => {
    const status = validate(goodSCC, ".scc", { formattedText: false });
    expect(status.success).toBe(true);
  });

  it("should validate vtt files", () => {
    const status = validate(goodVTT, ".vtt");
    expect(status.success).toBe(true);
  });

  it("should validate dfxp files", () => {
    const status = validate(goodDFXP, ".dfxp");
    expect(status.success).toBe(true);
  });

  it("should validate ttml files", () => {
    const status = validate(goodTTML, ".ttml");
    expect(status.success).toBe(true);
  });

  it("should throw an error when all entries are empty", () => {
    expect(() => validate(badAllEmpty, ".srt")).toThrow("Parsed file is empty");
  });
});
