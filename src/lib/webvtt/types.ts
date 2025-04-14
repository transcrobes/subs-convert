/**
 * WebVTT module types
 */

export interface Cue {
  identifier: string;
  start: number;
  end: number;
  text: string;
  styles: string;
}

export interface ParsedResult {
  valid: boolean;
  strict: boolean;
  cues: Cue[];
  errors: Error[];
  meta?: Record<string, string> | null;
}

export interface Segment {
  duration: number;
  cues: Cue[];
}

export interface HlsSegment {
  filename: string;
  content: string;
}

export interface ParserOptions {
  meta?: boolean;
  strict?: boolean;
}
