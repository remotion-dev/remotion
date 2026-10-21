import type {MediaParserLogLevel} from '@remotion/media-parser';
import {MediaParserInternals} from '@remotion/media-parser';

const {Log}: typeof MediaParserInternals = MediaParserInternals;

export {Log};

export type {MediaParserLogLevel as LogLevel};
