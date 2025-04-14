# subs-convert

Convert and modify subtitle files with TypeScript.

This project started as a largely automated (with VSCode Agent Mode) typescript migration of the original project `subtitle-converter`. All dependencies were updated to their latest versions, and build and test were migrated to `vite`/`vitest`. The `node-webvtt` and `subtitles-parser` dependencies were internalised along with tests, and also migrated to TS/Vite.

Currently supported input file types: `dfxp, scc, srt, ttml, vtt, ssa, ass`

Currently supported output file types: `srt, vtt`

All output files are encoded with `UTF-8`. In the future we may support more encoding types.

## Install

```bash
pnpm install @transcrobes/subs-convert
```

## Convert

TypeScript/ESM:
```typescript
import { readFileSync } from 'fs';
import { convert } from '@transcrobes/subs-convert';
import type { SubtitleOptions } from '@transcrobes/subs-convert';

const filepath = '/home/test/Downloads/english_subtitle.srt';
const subtitleText = readFileSync(filepath, 'utf-8');
const outputExtension = '.vtt'; // conversion is based on output file extension
const options: SubtitleOptions = {
  removeTextFormatting: true,
};

const { subtitle, status } = convert(subtitleText, outputExtension, options);

if (status.success) console.log(subtitle);
else console.log(status);
```

Browser:
```javascript
import { convert } from '@transcrobes/subs-convert';

function convertFile(fileObject) {
  const reader = new FileReader();
  let converted = '';
  reader.readAsText(fileObject);
  reader.onload = () => {
    const text = reader.result;
    const { subtitle, status } = convert(text, '.vtt');
    if(status.success) converted = subtitle;
    else console.log(status);
  };
  return converted;
}
```

## Options

**startAtZeroHour** (boolean) - Pass in `true` to make sure the timecodes start within

**shiftTimecode** (number) - Pass in the amount of seconds to shift the timecode. If undefined the output timecode will match the input.
- For example: `5`, `-5`, `5.2`

**sourceFps** (number) - Pass in the FPS of the video file used to create the input subtitle file. If `outputFps` is also included, `subs-convert` will shift the timecode accordingly to fit the output FPS.
- For example: `25`, `23.976`, `29.97`

**outputFps** (number) - Pass in the FPS desired for the output subtitle file. `sourceFps` is a required field in order to do FPS conversion.
- For example: `25`, `23.976`, `29.97`

**removeTextFormatting** (boolean) - Default is `false`. If set to `true`, tags such as `<b>` and `{bold}` will be stripped from the text. This may be useful when converting to formats that do not support styling in this manner.

**timecodeOverlapLimiter** (number, boolean) - Default is `false`, allowing overlapping timecode. If a number (in seconds) is included `subs-convert` will automatically fix overlapping timecode if the amount of seconds the text overlaps is less than the `timecodeOverlapLimiter`.
- If this value is set to `1` and your SRT looks like:
```
1
00:00:15,448 --> 00:00:18,000
Hello

2
00:00:17,417 --> 00:00:19,252
World
```
- Then the output would become:
```
1
00:00:15,448 --> 00:00:18,000
Hello

2
00:00:18,000 --> 00:00:19,252
World
```

**combineOverlapping** (boolean) - Default is `false`. If set to `true`, timecodes that are overlapping will be combined into one entry with a newline separating the text.

## Validate

Returns a `status` object with the following format.

```typescript
interface ValidationStatus {
  success: boolean;
  startsAtZeroHour?: boolean;
  timecodeIssues?: {
    reversedTimecodes?: { id: string; timecode?: string }[];
    overlappingTimecodes?: { id: string; timecode?: string }[];
  };
  formattedText?: { id: string; text?: string }[];
  invalidEntries?: { id: string; timecode?: string; text?: string }[];
  invalidTimecodes?: { id: string; timecode?: string }[];
  invalidIndices?: { id: string }[];
}
```

Example:
```typescript
// Validate with defaults
import { validate } from '@transcrobes/subs-convert';
const status = validate(text, '.srt');

console.log(status);

// Validate with options
import { validate } from '@transcrobes/subs-convert';
const status = validate(text, '.srt', {
    startsAtZeroHour: true,
    overlappingTimecodes: true
  });

console.log(status.success);
```

## Options

**Please Note:** If no options are passed, all checks will take place.  If options are specified, only those checks that are set to `true` will take place.

---
**startsAtZeroHour** (boolean) - checking if the first timecode starts at hour zero.

**reversedTimecodes** (boolean) - checking if there are any timecodes where the start time is after the end time.

**overlappingTimecodes** (boolean) - checking if there are any timecodes where a start time occurs before the previous end time.

**formattedText** (boolean) - checking if there is any formatted text. (`{an 1}`,`<i>This text is italicized</i>`).

---
**invalidEntries**  (Always detected) - checking if there are any odd entries or errors.

**invalidTimecodes** (Always detected) [`.srt`] - checking if there are any timecodes that are not in a valid format.

**invalidIndices** (Always detected) [`.srt`] - checking if there are any non-digit indices before timecodes.

## Development

This project uses:
- TypeScript for type safety
- Vite/Rollup for bundling
- Vitest for testing

### Building

```bash
pnpm run build
```

### Testing

```bash
pnpm test        # Run tests once
pnpm test:watch  # Run tests in watch mode
```
