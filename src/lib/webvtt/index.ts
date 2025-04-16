/**
 * WebVTT module exports
 */
import { parseWebVTT, ParserError } from "./parser";
import { compileWebVTT, CompilerError } from "./compiler";
import { segmentWebVTT } from "./segmenter";
import { hlsSegment, hlsSegmentPlaylist } from "./hls";

export {
  // Main functions
  parseWebVTT,
  compileWebVTT,
  segmentWebVTT,

  // HLS-related functions
  hlsSegment,
  hlsSegmentPlaylist,

  // Error types
  ParserError,
  CompilerError,
};
