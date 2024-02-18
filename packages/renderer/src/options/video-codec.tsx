import type {Codec, CodecOrUndefined} from '../codec';
import {validCodecs} from '../codec';
import type {AnyRemotionOption} from './option';

let codec: CodecOrUndefined;

const setCodec = (newCodec: CodecOrUndefined) => {
	if (newCodec === undefined) {
		codec = undefined;
		return;
	}

	if (!validCodecs.includes(newCodec)) {
		throw new Error(
			`Codec must be one of the following: ${validCodecs.join(
				', ',
			)}, but got ${newCodec}`,
		);
	}

	codec = newCodec;
};

export const getOutputCodecOrUndefined = () => {
	return codec;
};

const cliFlag = 'codec' as const;

export const videoCodecOption = {
	name: 'Codec',
	cliFlag,
	description: () => (
		<>
			H264 works well in most cases, but sometimes it&apos;s worth going for a
			different codec. WebM achieves higher compression but is slower to render.
			WebM, GIF and ProRes support transparency.
		</>
	),
	ssrName: 'codec',
	docLink: 'https://www.remotion.dev/docs/encoding/#choosing-a-codec',
	type: '' as Codec,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as Codec,
			};
		}

		if (codec !== undefined) {
			return {
				source: 'config',
				value: codec,
			};
		}

		return {
			source: 'default',
			value: 'h264',
		};
	},
	setConfig: setCodec,
} satisfies AnyRemotionOption<Codec>;
