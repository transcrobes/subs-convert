import { describe, it, expect } from "vitest";
import { compile } from "../../webvtt/compiler";
import { parse } from "../../webvtt/parser";
import { ParsedResult } from "../../webvtt/types";

describe("WebVTT compiler", () => {
  it("should not compile null", () => {
    // @ts-expect-error Testing invalid input
    expect(() => compile(null)).toThrow(/Input must be non-null/);
  });

  it("should not compile undefined", () => {
    // @ts-expect-error Testing invalid input
    expect(() => compile()).toThrow(/Input must be non-null/);
  });

  it("should not compile string", () => {
    // @ts-expect-error Testing invalid input
    expect(() => compile("a")).toThrow(/Input must be an object/);
  });

  it("should not compile array", () => {
    // @ts-expect-error Testing invalid input
    expect(() => compile([])).toThrow(/Input cannot be array/);
  });

  it("should compile object", () => {
    expect(() => {
      compile({
        cues: [
          {
            end: 1,
            identifier: "",
            start: 0,
            styles: "",
            text: "Hello world!",
          },
        ],
        valid: true,
        strict: true,
        errors: [],
      });
    }).not.toThrow();
  });

  it("should not compile invalid cue", () => {
    expect(() => {
      compile({
        cues: [
          {
            end: 1,
            identifier: "",
            start: 0,
            styles: "",
            text: "Hello world!",
          },
        ],
        valid: false,
        strict: true,
        errors: [],
      });
    }).toThrow(/valid/);
  });

  it("should compile string identifier", () => {
    expect(() => {
      compile({
        cues: [
          {
            end: 1,
            identifier: "chance",
            start: 0,
            styles: "",
            text: "Hello world!",
          },
        ],
        valid: true,
        strict: true,
        errors: [],
      });
    }).not.toThrow();
  });

  it("should compile empty identifier", () => {
    expect(() => {
      compile({
        cues: [
          {
            end: 1,
            identifier: "",
            start: 0,
            styles: "",
            text: "Hello world!",
          },
        ],
        valid: true,
        strict: true,
        errors: [],
      });
    }).not.toThrow();
  });

  it("should compile null identifier", () => {
    const input = {
      cues: [
        {
          end: 1,
          identifier: "" as any, // Using any for runtime-only tests that would fail type checking
          start: 0,
          styles: "",
          text: "Hello world!",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };
    input.cues[0].identifier = null;
    expect(() => compile(input as ParsedResult)).not.toThrow();
  });

  it("should compile numeric identifier", () => {
    const input = {
      cues: [
        {
          end: 1,
          identifier: "" as any, // Using any for runtime-only tests that would fail type checking
          start: 0,
          styles: "",
          text: "Hello world!",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };
    input.cues[0].identifier = 1;
    expect(() => compile(input as ParsedResult)).not.toThrow();
  });

  it("should not compile object cue", () => {
    const input = {
      cues: [
        {
          end: 1,
          identifier: "" as any, // Using any for runtime-only tests that would fail type checking
          start: 0,
          styles: "",
          text: "Hello world!",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };
    input.cues[0].identifier = {};
    expect(() => compile(input as ParsedResult)).toThrow(/identifier value/);
  });

  it("should compile cues with numeric start", () => {
    const input = {
      cues: [
        {
          end: 1,
          identifier: "",
          start: 0 as any, // Using any for runtime-only tests that would fail type checking
          styles: "",
          text: "Hello world!",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };
    input.cues[0].start = "0";
    expect(() => compile(input as ParsedResult)).not.toThrow();
  });

  it("should compile cues with numeric end", () => {
    const input = {
      cues: [
        {
          end: 1 as any, // Using any for runtime-only tests that would fail type checking
          identifier: "",
          start: 0,
          styles: "",
          text: "Hello world!",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };
    input.cues[0].end = "1";
    expect(() => compile(input as ParsedResult)).not.toThrow();
  });

  it("should not compile cues with non-numeric end", () => {
    const input = {
      cues: [
        {
          end: 1 as any, // Using any for runtime-only tests that would fail type checking
          identifier: "",
          start: 0,
          styles: "",
          text: "Hello world!",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };
    input.cues[0].end = "1a";
    expect(() => compile(input as ParsedResult)).toThrow(/Cue malformed/);
  });

  it("should not compile equal start and end times", () => {
    expect(() => {
      compile({
        cues: [
          {
            end: 1,
            identifier: "",
            start: 1,
            styles: "",
            text: "Hello world!",
          },
        ],
        valid: true,
        strict: true,
        errors: [],
      });
    }).toThrow(/Cue malformed/);
  });

  it("should not compile non-string text", () => {
    const input = {
      cues: [
        {
          end: 1,
          identifier: "",
          start: 0,
          styles: "",
          text: "" as any, // Using any for runtime-only tests that would fail type checking
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };
    input.cues[0].text = 1;
    expect(() => compile(input as ParsedResult)).toThrow(/Cue malformed/);
  });

  it("should not compile non-string styles", () => {
    const input = {
      cues: [
        {
          end: 1,
          identifier: "",
          start: 0,
          styles: "" as any, // Using any for runtime-only tests that would fail type checking
          text: "",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };
    input.cues[0].styles = null;
    expect(() => compile(input as ParsedResult)).toThrow(/Cue malformed/);
  });

  it("should compile properly", () => {
    const input: ParsedResult = {
      cues: [
        {
          end: 140,
          identifier: "1",
          start: 135.001,
          styles: "",
          text: "Ta en kopp varmt te.\nDet är inte varmt.",
        },
        {
          end: 145,
          identifier: "2",
          start: 140,
          styles: "",
          text: "Har en kopp te.\nDet smakar som te.",
        },
        {
          end: 150,
          identifier: "3",
          start: 145,
          styles: "",
          text: "Ta en kopp",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };

    const output = `WEBVTT

1
00:02:15.001 --> 00:02:20.000
Ta en kopp varmt te.
Det är inte varmt.

2
00:02:20.000 --> 00:02:25.000
Har en kopp te.
Det smakar som te.

3
00:02:25.000 --> 00:02:30.000
Ta en kopp
`;

    expect(compile(input)).toBe(output);
  });

  it("should compile with accurate milliseconds", () => {
    const input: ParsedResult = {
      cues: [
        {
          end: 1199.539,
          identifier: "1",
          start: 1199.529,
          styles: "",
          text: "Ta en kopp varmt te.\nDet är inte varmt.",
        },
        {
          end: 1199.549,
          identifier: "2",
          start: 1199.539,
          styles: "",
          text: "Har en kopp te.\nDet smakar som te.",
        },
        {
          end: 1199.558,
          identifier: "3",
          start: 1199.549,
          styles: "",
          text: "Ta en kopp",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };

    const output = `WEBVTT

1
00:19:59.529 --> 00:19:59.539
Ta en kopp varmt te.
Det är inte varmt.

2
00:19:59.539 --> 00:19:59.549
Har en kopp te.
Det smakar som te.

3
00:19:59.549 --> 00:19:59.558
Ta en kopp
`;

    expect(compile(input)).toBe(output);
  });

  it("should round properly", () => {
    const input: ParsedResult = {
      cues: [
        {
          end: 140.0001,
          identifier: "1",
          start: 135.9999,
          styles: "",
          text: "Ta en kopp varmt te.\nDet är inte varmt.",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };

    const output = `WEBVTT

1
00:02:15.999 --> 00:02:20.000
Ta en kopp varmt te.
Det är inte varmt.
`;

    expect(compile(input)).toBe(output);
  });

  it("should compile string start and end times", () => {
    const input = {
      cues: [
        {
          end: 1 as any,
          identifier: "",
          start: 0 as any,
          styles: "",
          text: "Hello world!",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };
    input.cues[0].end = "1";
    input.cues[0].start = "0";
    expect(() => compile(input as ParsedResult)).not.toThrow();
  });

  it("should be reversible", () => {
    const input = `WEBVTT

1
00:02:15.001 --> 00:02:20.000
Ta en kopp varmt te.
Det är inte varmt.

2
00:02:20.000 --> 00:02:25.000
Har en kopp te.
Det smakar som te.

3
00:02:25.000 --> 00:02:30.000
Ta en kopp
`;
    expect(compile(parse(input))).toBe(input);
  });

  it("should not compile non string styles", () => {
    const input = {
      cues: [
        {
          end: 1,
          identifier: "",
          start: 0,
          styles: "" as any, // Using any for runtime-only tests that would fail type checking
          text: "Hello world!",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };
    input.cues[0].styles = 0;
    expect(() => compile(input as ParsedResult)).toThrow(/Cue malformed/);
  });

  it("should not compile non string text", () => {
    const input = {
      cues: [
        {
          end: 1,
          identifier: "",
          start: 0,
          styles: "",
          text: "" as any, // Using any for runtime-only tests that would fail type checking
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };
    input.cues[0].text = 0;
    expect(() => compile(input as ParsedResult)).toThrow(/Cue malformed/);
  });

  it("should not compile NaN start", () => {
    expect(() => {
      compile({
        cues: [
          {
            end: 1,
            identifier: "",
            start: NaN,
            styles: "",
            text: "Hello world!",
          },
        ],
        valid: true,
        strict: true,
        errors: [],
      });
    }).toThrow(/Cue malformed/);
  });

  it("should not compile non object cues", () => {
    const input = {
      cues: [] as any, // Using any for runtime-only tests that would fail type checking
      valid: true,
      strict: true,
      errors: [],
    };
    input.cues = [1];
    expect(() => compile(input as ParsedResult)).toThrow(/Cue malformed/);
  });

  it("should compile styles", () => {
    const input: ParsedResult = {
      cues: [
        {
          end: 140,
          identifier: "1",
          start: 135.001,
          styles: "align:start line:0%",
          text: "Hello world",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };

    const output = `WEBVTT

1
00:02:15.001 --> 00:02:20.000 align:start line:0%
Hello world
`;

    expect(compile(input)).toBe(output);
  });

  it("should compile metadata", () => {
    const input: ParsedResult = {
      meta: {
        Kind: "captions",
        Language: "en",
        "X-TIMESTAMP-MAP=LOCAL": "00:00:00.000,MPEGTS:0",
      },
      cues: [
        {
          end: 140,
          identifier: "1",
          start: 135.001,
          text: "Hello world",
          styles: "",
        },
      ],
      valid: true,
      strict: true,
      errors: [],
    };

    const output = `WEBVTT
Kind: captions
Language: en
X-TIMESTAMP-MAP=LOCAL: 00:00:00.000,MPEGTS:0

1
00:02:15.001 --> 00:02:20.000
Hello world
`;

    expect(compile(input)).toBe(output);
  });

  it("should not compile non-object metadata", () => {
    const input = {
      meta: {} as any, // Using any for runtime-only tests that would fail type checking
      cues: [],
      valid: true,
      strict: true,
      errors: [],
    };
    input.meta = [];
    expect(() => compile(input as ParsedResult)).toThrow(/Metadata must be an object/);
  });

  it("should not compile non-string metadata values", () => {
    const input = {
      meta: {} as any, // Using any for runtime-only tests that would fail type checking
      cues: [],
      valid: true,
      strict: true,
      errors: [],
    };
    input.meta = { foo: [] };
    expect(() => compile(input as ParsedResult)).toThrow(/Metadata value for "foo" must be string/);
  });

  it("should not compile cues in non-chronological order", () => {
    const input: ParsedResult = {
      valid: true,
      strict: true,
      errors: [],
      cues: [
        {
          identifier: "",
          start: 30,
          end: 31,
          text: "This is a subtitle",
          styles: "align:start line:0%",
        },
        {
          identifier: "",
          start: 0,
          end: 1,
          text: "Hello world!",
          styles: "",
        },
      ],
    };

    expect(() => compile(input)).toThrow(/Cue number \d+ is not in chronological order/);
  });

  it("should allow cues that overlap in time", () => {
    const input: ParsedResult = {
      valid: true,
      strict: true,
      errors: [],
      cues: [
        {
          identifier: "",
          start: 1,
          end: 5,
          text: "This is a subtitle",
          styles: "align:start line:0%",
        },
        {
          identifier: "",
          start: 3,
          end: 7,
          text: "Hello world!",
          styles: "",
        },
      ],
    };

    expect(() => compile(input)).not.toThrow();
  });
});
