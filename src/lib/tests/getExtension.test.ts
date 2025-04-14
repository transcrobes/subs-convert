import { describe, it, expect } from "vitest";
import { getExtension } from "@lib/shared/utils";
import { mixedSubtitles } from "@lib/tests/mocks/mixedSubtitles";

describe("#getExtension", () => {
  mixedSubtitles.forEach((subtitle) => {
    const { subtitleText, type } = subtitle;
    it(`should be a(n) ${type} file`, () => {
      expect(getExtension(subtitleText)).toBe(type);
    });
  });
});
