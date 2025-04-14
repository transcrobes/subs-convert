/**
 * Regex Constants for Subtitle Extension Detection
 */

// GENERAL REGEX
const lineBreak = "(?:\\r\\n|\\n|\\r)";

// VTT REGEX
// Minimum requirements for 'node-webvtt' library
const vttRegex = `^\\s*WEBVTT[^]*?${lineBreak}{2,}`;

// SCC REGEX
// Minimum requirements for scc_to_json module
const sccTimeCode = "\\d{2}:\\d{2}:\\d{2}[;:]\\d{2}";
const sccRegex = `${sccTimeCode}(?:(\\s)[a-fA-F0-9]{4})+[ ]?`;

// TTML REGEX (Earlier name: DFXP)
// Minimum requirements for 'xml2js' library
const ttmlRegex = "^([^]+?)?<tt.*?>";

// ASS REGEX
// Minimum requirements top of .ass file
const assRegex = "^([^]+?)?\\[Script Info\\]";

// SRT REGEX
// Minimum requirements for 'srtEntries' module
// const srtRegex = '\\d+\\s*[\r\n]+\\s*\\d{2}:\\d{2}:\\d{2}[,.]\\d{3}\\s*-->\\s*\\d{2}:\\d{2}:\\d{2}[,.]\\d{3}';
const srtRegex = "-->";

export interface ExtensionRegex {
  extension: string;
  regex: RegExp;
}

export const ALL_VALID_EXT_REGEX = new RegExp(`(${vttRegex}|${sccRegex}|${ttmlRegex}|${assRegex}|${srtRegex})`);
export const VALID_EXT_REGEX_ARRAY: ExtensionRegex[] = [
  { extension: ".vtt", regex: new RegExp(vttRegex) },
  { extension: ".scc", regex: new RegExp(sccRegex) },
  { extension: ".ttml", regex: new RegExp(ttmlRegex) },
  { extension: ".ass", regex: new RegExp(assRegex) },
  { extension: ".srt", regex: new RegExp(srtRegex) },
];
