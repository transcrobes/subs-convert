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
  source?: any;
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
