import { describe, it, expect } from "vitest";
import fs from "fs";
import path from "path";
import { hlsSegment, hlsSegmentPlaylist } from "../../webvtt/hls";

describe("WebVTT HLS segmenter", () => {
  it("should generate playlist for a simple subtitles file", () => {
    const input = `WEBVTT

00:00.000 --> 00:10.000
a

00:10.000 --> 00:20.000
a`;
    const expectedPlaylist = `#EXTM3U
#EXT-X-TARGETDURATION:10
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXTINF:10.00000,
0.vtt
#EXTINF:10.00000,
1.vtt
#EXT-X-ENDLIST
`;
    const generated = hlsSegmentPlaylist(input, 10);

    expect(generated).toBe(expectedPlaylist);
  });

  it("should generate segments for a simple subtitles file", () => {
    const input = `WEBVTT

1
01:01:01.800 --> 01:12:19.999 align:start line:0%
a

2
05:59:59.000 --> 05:59:59.999
b`;
    const expectedFirstSegment = `WEBVTT
X-TIMESTAMP-MAP=MPEGTS:900000,LOCAL:00:00:00.000

1
01:01:01.800 --> 01:12:19.999 align:start line:0%
a
`;

    const expectedSecondSegment = `WEBVTT
X-TIMESTAMP-MAP=MPEGTS:900000,LOCAL:00:00:00.000

2
05:59:59.000 --> 05:59:59.999
b
`;

    const generated = hlsSegment(input, 3);

    expect(generated[0].filename).toBe("0.vtt");
    expect(generated[0].content).toBe(expectedFirstSegment);
    expect(generated[1].filename).toBe("1.vtt");
    expect(generated[1].content).toBe(expectedSecondSegment);
  });

  it("should generate allow for setting starting offset of segments", () => {
    const input = `WEBVTT

00:00:00.000 --> 01:00:00.000
a
`;
    const expectedSegment = `WEBVTT
X-TIMESTAMP-MAP=MPEGTS:0,LOCAL:00:00:00.000

00:00:00.000 --> 01:00:00.000
a
`;

    const generated = hlsSegment(input, 3, "0");

    expect(generated[0].filename).toBe("0.vtt");
    expect(generated[0].content).toBe(expectedSegment);
  });

  it.skip("should generate correct playlist, compared to apple tool", () => {
    const input = fs.readFileSync(path.join(__dirname, "data/subs1.vtt"), "utf8");
    const expectedPlaylist = fs.readFileSync(path.join(__dirname, "data/playlist1.m3u8"), "utf8");

    const generated = hlsSegmentPlaylist(input, 10);

    expect(generated).toBe(expectedPlaylist);
  });

  it("should round target duration up to second", () => {
    const input = `WEBVTT

00:00.000 --> 00:10.000
a

00:10.000 --> 00:22.500
a`;
    const expectedPlaylist = `#EXTM3U
#EXT-X-TARGETDURATION:13
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
#EXTINF:10.00000,
0.vtt
#EXTINF:12.50000,
1.vtt
#EXT-X-ENDLIST
`;
    const generated = hlsSegmentPlaylist(input, 10);

    expect(generated).toBe(expectedPlaylist);
  });
});
