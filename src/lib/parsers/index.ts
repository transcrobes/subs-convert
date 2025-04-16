import { SubtitleOptions, ParseResult } from "../shared/types";

// Import parsers from their TypeScript implementations
import sccParser from "./scc";
import srtParser from "./srt";
import ttmlParser from "./ttml";
import vttParser from "./vtt";
import assParser from "./ass";

 
function parse(subtitleText: string, inputExtension: string, options: SubtitleOptions = {}): ParseResult {
  switch (inputExtension) {
    case ".srt":
      return srtParser(subtitleText, options);
    case ".scc":
      return sccParser(subtitleText, options);
    case ".vtt":
      return vttParser(subtitleText, options);
    case ".ass":
      return assParser(subtitleText, options);
    case ".dfxp":
    case ".ttml":
      return ttmlParser(subtitleText, options); // Use .ttml for dfxp as well
    default:
      throw Error(
        `File type ${inputExtension} is not supported. Supported input file types include:\n` +
          "dfxp, scc, srt, ttml, vtt, and ass",
      );
  }
}

export default parse;
