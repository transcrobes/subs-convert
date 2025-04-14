import { SubtitleEntry, ValidationOptions, ValidationStatus } from "../shared/types";

interface TimecodeIssue {
  id: string;
  timecode?: string;
  text?: string;
}

/* eslint-disable complexity */
function buildStatusObject(options: ValidationOptions): ValidationStatus {
  const status: ValidationStatus = {
    success: true,
  };

  if (options.startsAtZeroHour) status.startsAtZeroHour = true;

  if (options.reversedTimecodes || options.overlappingTimecodes) {
    status.timecodeIssues = {};

    if (options.reversedTimecodes) {
      status.timecodeIssues.reversedTimecodes = [];
    }

    if (options.overlappingTimecodes) {
      status.timecodeIssues.overlappingTimecodes = [];
    }
  }

  if (options.formattedText) status.formattedText = [];

  return status;
}

function validateStandardized(
  standardizedText: SubtitleEntry[],
  options: ValidationOptions = {
    startsAtZeroHour: true,
    reversedTimecodes: true,
    overlappingTimecodes: true,
    formattedText: true,
  },
): ValidationStatus {
  const status = buildStatusObject(options);

  let prevEndTime = 0;
  standardizedText.forEach((entry, index) => {
    const { id, timecode, startMicro, endMicro, text } = entry;

    // VALIDATE IDS

    // VALIDATE TIMECODES
    // Check starts at zero hour
    const oneHourMicro = 3600000000;
    if (options.startsAtZeroHour && index === 0 && startMicro >= oneHourMicro) {
      status.startsAtZeroHour = false;
      status.success = false;
    }

    // Check overlapping times
    if (options.overlappingTimecodes && startMicro < prevEndTime && status.timecodeIssues?.overlappingTimecodes) {
      status.timecodeIssues.overlappingTimecodes.push({ id, timecode } as TimecodeIssue);
      status.success = false;
    }

    // Check reversed time
    if (options.reversedTimecodes && startMicro > endMicro && status.timecodeIssues?.reversedTimecodes) {
      status.timecodeIssues.reversedTimecodes.push({ id, timecode } as TimecodeIssue);
      status.success = false;
    }

    // VALIDATE TEXT
    // Check for formatted text
    if (options.formattedText && text.match(/{|}|<|>/) && status.formattedText) {
      status.formattedText.push({ id, text } as TimecodeIssue);
      status.success = false;
    }

    // UPDATE PREVIOUS
    prevEndTime = endMicro;
  });

  return status;
}

export default validateStandardized;
