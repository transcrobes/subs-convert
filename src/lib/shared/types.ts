export interface SubtitleStyles {
  align?: string;
  line?: string;
  position?: string;
  size?: string;
  [key: string]: string | undefined;
}

export interface SubtitleCaptions {
  frames?: number;
  popOn?: boolean;
  paintOn?: boolean;
  rollUpRows?: number;
  commands?: string;
}

export interface SubtitleEntry {
  id: string;
  timecode?: string;
  startMicro: number;
  endMicro: number;
  captions?: SubtitleCaptions;
  styles?: SubtitleStyles;
  text: string;
}

export interface SubtitleGlobal {
  language?: string;
  color?: string;
  textAlign?: string;
}

export interface SubtitleJSON {
  global?: SubtitleGlobal;
  body: SubtitleEntry[];
  source?: unknown;
}

export interface SubtitleOptions {
  shiftTimecode?: number;
  sourceFps?: number;
  outputFps?: number;
  removeTextFormatting?: boolean;
  timecodeOverlapLimiter?: number | boolean;
  combineOverlapping?: boolean;
  startAtZeroHour?: boolean;
}

export interface ValidationOptions {
  startsAtZeroHour?: boolean;
  reversedTimecodes?: boolean;
  overlappingTimecodes?: boolean;
  formattedText?: boolean;
}

export interface ValidationIssue {
  id: string;
  timecode?: string;
  text?: string;
}

export interface ValidationStatus {
  success: boolean;
  startsAtZeroHour?: boolean;
  timecodeIssues?: {
    reversedTimecodes?: ValidationIssue[];
    overlappingTimecodes?: ValidationIssue[];
  };
  formattedText?: ValidationIssue[];
  invalidEntries?: ValidationIssue[];
  invalidTimecodes?: ValidationIssue[];
  invalidIndices?: { id: string }[];
}

export interface ParseResult {
  data: SubtitleJSON;
  status: ValidationStatus;
}

export interface ConversionResult {
  subtitle: string;
  status: ValidationStatus;
}

/**
 * WebVTT cue type (for use in webvtt modules)
 */
export interface WebVTTCue {
  identifier: string;
  start: number; // seconds
  end: number; // seconds
  text: string;
  styles: string;
}

/**
 * ParsedResult for WebVTT and similar modules
 */
export interface ParsedResult {
  valid: boolean;
  strict: boolean;
  cues: WebVTTCue[];
  errors: Error[];
  meta?: Record<string, string> | null;
}

export interface Segment {
  duration: number;
  cues: WebVTTCue[];
}

export interface HlsSegment {
  filename: string;
  content: string;
}

export interface ParserOptions {
  meta?: boolean;
  strict?: boolean;
}

/**
 * SRT parsing options (used in srtEntries)
 */
export interface SrtEntryOptions {
  invalidEntries?: boolean;
  invalidTimecodes?: boolean;
  invalidIndices?: boolean;
}

/**
 * Accumulator for SRT parsing (used in srtEntries)
 */
export interface SrtAccumulator {
  currentIndex: number;
  validEntries: SubtitleEntry[];
  status: ValidationStatus;
}

export type ParseExtension = ".srt" | ".vtt" | ".dfxp" | ".ttml" | ".scc" | ".ass";
export type ExportExtension = ".srt" | ".vtt";
