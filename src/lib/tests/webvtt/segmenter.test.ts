import { describe, it, expect } from "vitest";
import { parseWebVTT } from "../../webvtt/parser";
import { segmentWebVTT } from "../../webvtt/segmenter";

describe("WebVTT segment", () => {
  it("should not segment a single cue", () => {
    const input = `WEBVTT

00:00.000 --> 00:05.000
a`;
    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input, 10);

    expect(parsed.cues).toHaveLength(1);
    expect(segmented).toHaveLength(1);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
  });

  it("should return correct duration for single cue w/start > 0", () => {
    const input = `WEBVTT

00:11.000 --> 00:15.000
a`;
    const segmented = segmentWebVTT(input, 10);
    expect(segmented[0].duration).toBe(15);
  });

  it("should segment a short playlist in two w/correct duration", () => {
    const input = `WEBVTT

00:00.000 --> 00:10.000
a

00:10.000 --> 00:19.000
a`;
    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input);

    expect(parsed.cues).toHaveLength(2);
    expect(segmented).toHaveLength(2);
    expect(segmented[0].duration).toBe(10);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].duration).toBe(9);
    expect(segmented[1].cues[0]).toEqual(parsed.cues[1]);
  });

  it("should segment a short playlist in two w/silence between", () => {
    const input = `WEBVTT

00:00.000 --> 00:01.000
a

00:11.000 --> 00:20.000
b`;
    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input);

    expect(parsed.cues).toHaveLength(2);
    expect(segmented).toHaveLength(2);
    expect(segmented[0].duration).toBe(10);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].duration).toBe(10);
    expect(segmented[1].cues[0]).toEqual(parsed.cues[1]);
  });

  it("should skip empty cues in segmenting", () => {
    const input = `WEBVTT

00:00.000 --> 00:01.000

01:11.000 --> 01:20.000
b`;
    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input);

    expect(parsed.cues).toHaveLength(1);
    expect(segmented).toHaveLength(1);
    expect(segmented[0].duration).toBe(80);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
  });

  it("should have cue that passes boundaries in two segments", () => {
    const input = `WEBVTT

00:00.000 --> 00:11.000
a

00:11.000 --> 00:20.000
b`;
    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input, 10);

    expect(parsed.cues).toHaveLength(2);
    expect(segmented).toHaveLength(2);
    expect(segmented[0].cues).toHaveLength(1);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].cues).toHaveLength(2);
    expect(segmented[1].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].cues[1]).toEqual(parsed.cues[1]);
  });

  it("should have correct duration if boundary cues", () => {
    const input = `WEBVTT

00:11.000 --> 00:20.100
a

00:20.100 --> 00:22.000
b`;
    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input, 10);

    expect(parsed.cues).toHaveLength(2);
    expect(segmented).toHaveLength(2);
    expect(segmented[0].duration).toBe(20);
    expect(segmented[0].cues).toHaveLength(1);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].duration).toBe(2);
    expect(segmented[1].cues).toHaveLength(2);
    expect(segmented[1].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].cues[1]).toEqual(parsed.cues[1]);
  });

  it("should segment four cues w/two boundaries", () => {
    const input = `WEBVTT

00:00.000 --> 00:05.000
a

00:05.000 --> 00:11.000
b

00:11.000 --> 00:21.000
c

00:21.000 --> 00:31.000
d`;
    const parsed = parseWebVTT(input);
    const segs = segmentWebVTT(input, 10);

    expect(parsed.cues).toHaveLength(4);
    expect(segs).toHaveLength(3);
    expect(segs[0].duration).toBe(10);
    expect(segs[0].cues).toHaveLength(2);
    expect(segs[0].cues[0]).toEqual(parsed.cues[0]);
    expect(segs[0].cues[1]).toEqual(parsed.cues[1]);

    expect(segs[1].duration).toBe(10);
    expect(segs[1].cues).toHaveLength(2);
    expect(segs[1].cues[0]).toEqual(parsed.cues[1]);
    expect(segs[1].cues[1]).toEqual(parsed.cues[2]);

    expect(segs[2].duration).toBe(11);
    expect(segs[2].cues).toHaveLength(2);
    expect(segs[2].cues[0]).toEqual(parsed.cues[2]);
    expect(segs[2].cues[1]).toEqual(parsed.cues[3]);
  });

  it("should have correct durations for segments on boundary", () => {
    const input = `WEBVTT

00:00:09.000 --> 00:00:19.000
a

00:00:19.000 --> 00:00:20.000
b`;
    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input);

    expect(parsed.cues).toHaveLength(2);
    expect(segmented).toHaveLength(2);
    expect(segmented[0].duration).toBe(10);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].duration).toBe(10);
    expect(segmented[1].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].cues[1]).toEqual(parsed.cues[1]);
  });

  it("should have right durations for segs on boundary w/longer end", () => {
    const input = `WEBVTT

00:00:09.000 --> 00:00:19.000
a

00:00:19.000 --> 00:00:25.000
b`;
    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input);

    expect(parsed.cues).toHaveLength(2);
    expect(segmented).toHaveLength(2);
    expect(segmented[0].duration).toBe(10);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].duration).toBe(15);
    expect(segmented[1].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].cues[1]).toEqual(parsed.cues[1]);
  });

  it("should segment correctly if silence between four cues", () => {
    const input = `WEBVTT

00:00:00.000 --> 00:00:01.000
a

00:00:30.000 --> 00:00:31.000
b

00:01:00.000 --> 00:01:01.000
c

00:01:50.000 --> 00:01:51.000
d`;
    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input);

    expect(parsed.cues).toHaveLength(4);
    expect(segmented).toHaveLength(4);
    expect(segmented[0].duration).toBe(10);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].duration).toBe(30);
    expect(segmented[1].cues[0]).toEqual(parsed.cues[1]);
    expect(segmented[2].duration).toBe(30);
    expect(segmented[2].cues[0]).toEqual(parsed.cues[2]);
    expect(segmented[3].duration).toBe(41);
    expect(segmented[3].cues[0]).toEqual(parsed.cues[3]);
  });

  it("should segment correctly when passing hours", () => {
    const input = `WEBVTT

00:59:00.000 --> 00:59:10.000
a

00:59:59.000 --> 01:00:11.000
b`;
    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input);

    expect(parsed.cues).toHaveLength(2);
    expect(segmented).toHaveLength(2);
    expect(segmented[0].duration).toBe(3550);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].duration).toBe(61);
    expect(segmented[1].cues[0]).toEqual(parsed.cues[1]);
  });

  it("should group many cues together in a segment", () => {
    const input = `WEBVTT

00:00:00.000 --> 00:00:11.360
a

00:00:11.430 --> 00:00:13.110
b

00:00:13.230 --> 00:00:15.430
c

00:00:15.520 --> 00:00:17.640
d

00:00:17.720 --> 00:00:19.950
e

00:01:43.840 --> 00:01:46.800
f`;

    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input);

    expect(parsed.cues).toHaveLength(6);
    expect(segmented).toHaveLength(3);
    expect(segmented[0].duration).toBe(10);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].duration).toBe(10);
    expect(segmented[1].cues).toHaveLength(5);
    expect(segmented[1].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[1].cues[1]).toEqual(parsed.cues[1]);
    expect(segmented[1].cues[2]).toEqual(parsed.cues[2]);
    expect(segmented[1].cues[3]).toEqual(parsed.cues[3]);
    expect(segmented[1].cues[4]).toEqual(parsed.cues[4]);
    expect(segmented[2].duration).toBe(86.8);
    expect(segmented[2].cues[0]).toEqual(parsed.cues[5]);
  });

  it("should segment a longer playlist correctly", () => {
    const input = `WEBVTT

00:00:01.800 --> 00:00:05.160
0

00:00:05.400 --> 00:00:07.560
1

00:00:07.640 --> 00:00:09.600
2

00:00:09.720 --> 00:00:11.360
3

00:00:11.430 --> 00:00:13.110
4

00:00:13.230 --> 00:00:15.430
5

00:00:15.520 --> 00:00:17.640
6

00:00:17.720 --> 00:00:19.950
7

00:00:20.040 --> 00:00:23.760
8

00:00:23.870 --> 00:00:26.320
9

00:00:26.400 --> 00:00:28.560
10

00:00:28.640 --> 00:00:30.870
11`;

    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input);

    expect(parsed.cues).toHaveLength(12);
    expect(segmented).toHaveLength(3);
    expect(segmented[0].duration).toBe(10);
    expect(segmented[0].cues).toHaveLength(4);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[0].cues[1]).toEqual(parsed.cues[1]);
    expect(segmented[0].cues[2]).toEqual(parsed.cues[2]);
    expect(segmented[0].cues[3]).toEqual(parsed.cues[3]);

    expect(segmented[1].duration).toBe(10);
    expect(segmented[1].cues).toHaveLength(5);
    expect(segmented[1].cues[0]).toEqual(parsed.cues[3]);
    expect(segmented[1].cues[1]).toEqual(parsed.cues[4]);
    expect(segmented[1].cues[2]).toEqual(parsed.cues[5]);
    expect(segmented[1].cues[3]).toEqual(parsed.cues[6]);
    expect(segmented[1].cues[4]).toEqual(parsed.cues[7]);

    expect(segmented[2].duration).toBe(10.87);
    expect(segmented[2].cues).toHaveLength(4);
    expect(segmented[2].cues[0]).toEqual(parsed.cues[8]);
    expect(segmented[2].cues[1]).toEqual(parsed.cues[9]);
    expect(segmented[2].cues[2]).toEqual(parsed.cues[10]);
    expect(segmented[2].cues[3]).toEqual(parsed.cues[11]);
  });

  it("should allow cues to intersect", () => {
    const input = `WEBVTT

00:00:00.000 --> 00:00:12.000
a

00:00:01.000 --> 00:00:13.000
b`;
    const parsed = parseWebVTT(input);
    const segmented = segmentWebVTT(input);

    expect(parsed.cues).toHaveLength(2);
    expect(segmented).toHaveLength(1);
    expect(segmented[0].duration).toBe(13);
    expect(segmented[0].cues).toHaveLength(2);
    expect(segmented[0].cues[0]).toEqual(parsed.cues[0]);
    expect(segmented[0].cues[1]).toEqual(parsed.cues[1]);
  });
});
