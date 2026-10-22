import type {AnyRemotionOption} from './option';

/**
 * encodingBufferSize is not a bitrate, but it is a bitrate-related option and get validated like a bitrate.
 */
let encodingBufferSize: string | null = null;

const setEncodingBufferSize = (bitrate: string | null) => {
	encodingBufferSize = bitrate;
};

const cliFlag = 'buffer-size' as const;

export const encodingBufferSizeOption = {
	name: 'FFmpeg -bufsize flag',
	addedIn: '4.0.78',
	cliFlag,
	description: () => (
		<>
			The value for the <code>-bufsize</code> flag of FFmpeg. Should be used in
			conjunction with the encoding max rate flag. With the VP8, VP9 and AV1
			codecs, a video bitrate must also be set.
		</>
	),
	ssrName: 'encodingBufferSize' as const,
	docLink: 'https://www.remotion.dev/docs/options/buffer-size',
	type: '' as string | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				value: commandLine[cliFlag] as string,
				source: 'cli',
			};
		}

		if (encodingBufferSize !== null) {
			return {
				value: encodingBufferSize,
				source: 'config',
			};
		}

		return {
			value: null,
			source: 'default',
		};
	},
	setConfig: setEncodingBufferSize,
	id: cliFlag,
} satisfies AnyRemotionOption<string | null>;
