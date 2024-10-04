import {ensureMaxCharactersPerLine} from './ensure-max-characters-per-line';

export {Caption} from './caption';
export {
	createTikTokStyleCaptions,
	CreateTikTokStyleCaptionsInput,
	CreateTikTokStyleCaptionsOutput,
	TikTokPage,
	TikTokToken,
} from './create-tiktok-style-captions';
export {
	EnsureMaxCharactersPerLineInput,
	EnsureMaxCharactersPerLineOutput,
} from './ensure-max-characters-per-line';
export {parseSrt, ParseSrtInput, ParseSrtOutput} from './parse-srt';
export {serializeSrt, SerializeSrtInput} from './serialize-srt';

export const CaptionsInternals = {
	ensureMaxCharactersPerLine,
};
