import Joi from "joi";
import { ALL_VALID_EXT_REGEX } from "./extensionRegex";

export const SUBTITLE_SCHEMA = Joi.object().keys({
  global: Joi.object().keys({
    language: Joi.string(),
    color: Joi.string(),
    textAlign: Joi.string(),
  }),
  body: Joi.array().items(
    Joi.object().keys({
      id: Joi.string(),
      timecode: Joi.string(),
      startMicro: Joi.number().unit("microseconds"),
      endMicro: Joi.number().unit("microseconds"),
      captions: {
        frames: Joi.number().integer(),
        popOn: Joi.boolean(),
        paintOn: Joi.boolean(),
        rollUpRows: Joi.number().integer(),
        commands: Joi.string(),
      },
      styles: Joi.object().keys({
        align: Joi.string(),
        line: Joi.string(),
        position: Joi.string(),
        size: Joi.string(),
      }),
      text: Joi.string(),
    }),
  ),
  source: Joi.any(),
});

export const PARAM_SCHEMA = Joi.object().keys({
  subtitleText: Joi.string()
    .regex(ALL_VALID_EXT_REGEX)
    .required()
    .error(() => "Input file type is not supported."),
  outputExtension: Joi.string().required(),
  options: Joi.object().keys({
    shiftTimecode: Joi.number(),
    sourceFps: Joi.number().positive(),
    outputFps: Joi.number().positive(),
    removeTextFormatting: Joi.boolean(),
    timecodeOverlapLimiter: Joi.alternatives().try(Joi.number().positive().allow(0), Joi.boolean()),
    combineOverlapping: Joi.boolean(),
    startAtZeroHour: Joi.boolean(),
  }),
});
