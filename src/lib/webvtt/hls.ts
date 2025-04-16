/**
 * WebVTT HLS (HTTP Live Streaming) implementation
 */
import { WebVTTCue as Cue, HlsSegment } from "../shared/types";
import { segment } from "./segmenter";

export function hlsSegment(input: string, segmentLength?: number, startOffset: string = "900000"): HlsSegment[] {
  const segments = segment(input, segmentLength);
  const result: HlsSegment[] = [];

  segments.forEach((seg, i) => {
    const content = `WEBVTT
X-TIMESTAMP-MAP=MPEGTS:${startOffset},LOCAL:00:00:00.000

${printableCues(seg.cues)}
`;
    const filename = generateSegmentFilename(i);
    result.push({ filename, content });
  });

  return result;
}

export function hlsSegmentPlaylist(input: string, segmentLength?: number): string {
  const segmented = segment(input, segmentLength);

  const printable = printableSegments(segmented);
  const longestSegment = Math.round(findLongestSegment(segmented));

  const template = `#EXTM3U
#EXT-X-TARGETDURATION:${longestSegment}
#EXT-X-VERSION:3
#EXT-X-MEDIA-SEQUENCE:0
#EXT-X-PLAYLIST-TYPE:VOD
${printable}
#EXT-X-ENDLIST
`;
  return template;
}

function pad(num: number, n: number): string {
  const padding = "0".repeat(Math.max(0, n - num.toString().length));
  return `${padding}${num}`;
}

function generateSegmentFilename(index: number): string {
  return `${index}.vtt`;
}

function printableSegments(segments: { duration: number }[]): string {
  const result: string[] = [];
  segments.forEach((seg, i) => {
    result.push(`#EXTINF:${seg.duration.toFixed(5)},
${generateSegmentFilename(i)}`);
  });

  return result.join("\n");
}

function findLongestSegment(segments: { duration: number }[]): number {
  let max = 0;
  segments.forEach((seg) => {
    if (seg.duration > max) {
      max = seg.duration;
    }
  });

  return max;
}

function printableCues(cues: Cue[]): string {
  const result: string[] = [];
  cues.forEach((cue) => {
    result.push(printableCue(cue));
  });

  return result.join("\n\n");
}

function printableCue(cue: Cue): string {
  const printable: string[] = [];

  if (cue.identifier) {
    printable.push(cue.identifier);
  }

  const start = printableTimestamp(cue.start);
  const end = printableTimestamp(cue.end);

  // Only add the space if styles exist, otherwise don't add trailing space
  if (cue.styles) {
    printable.push(`${start} --> ${end} ${cue.styles}`);
  } else {
    printable.push(`${start} --> ${end}`);
  }

  printable.push(cue.text);

  return printable.join("\n");
}

function printableTimestamp(timestamp: number): string {
  const ms = parseFloat((timestamp % 1).toFixed(3));
  timestamp = Math.round(timestamp - ms);
  const hours = Math.floor(timestamp / 3600);
  const mins = Math.floor((timestamp - hours * 3600) / 60);
  const secs = timestamp - hours * 3600 - mins * 60;

  // TODO hours aren't required by spec, but we include them, should be config
  const hourString = `${pad(hours, 2)}:`;
  return `${hourString}${pad(mins, 2)}:${pad(secs, 2)}.${pad(ms * 1000, 3)}`;
}
