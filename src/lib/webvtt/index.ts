/**
 * WebVTT module exports
 */
import { parse, ParserError } from "./parser";
import { compile, CompilerError } from "./compiler";
import { segment } from "./segmenter";
import { hlsSegment, hlsSegmentPlaylist } from "./hls";

export {
  // Main functions
  parse,
  compile,
  segment,

  // HLS-related functions
  hlsSegment,
  hlsSegmentPlaylist,

  // Error types
  ParserError,
  CompilerError,
};
