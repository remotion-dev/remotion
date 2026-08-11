import type {PixelFormat} from '../pixel-format';
import {DEFAULT_PIXEL_FORMAT, validPixelFormats} from '../pixel-format';
import type {AnyRemotionOption} from './option';

let currentPixelFormat: PixelFormat = DEFAULT_PIXEL_FORMAT;

const cliFlag = 'pixel-format' as const;

export const pixelFormatOption = {
	name: 'Pixel format',
	cliFlag,
	description: () => (
		<>
			Sets the pixel format in FFmpeg. See{' '}
			<a href="https://trac.ffmpeg.org/wiki/Chroma%20Subsampling">
				the FFmpeg docs for an explanation
			</a>
			. Acceptable values: {validPixelFormats.map((f) => `"${f}"`).join(', ')}.
		</>
	),
	ssrName: 'pixelFormat' as const,
	docLink: 'https://www.remotion.dev/docs/config#setpixelformat',
	type: DEFAULT_PIXEL_FORMAT as PixelFormat,
	getValue: (
		{commandLine},
		options?: {
			uiPixelFormat: PixelFormat | null;
			compositionDefaultPixelFormat: PixelFormat | null;
		},
	) => {
		if (options?.uiPixelFormat) {
			return {
				source: 'via UI',
				value: options.uiPixelFormat,
			};
		}

		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'from --pixel-format flag',
				value: commandLine[cliFlag] as PixelFormat,
			};
		}

		if (options && options.compositionDefaultPixelFormat !== null) {
			return {
				source: 'via calculateMetadata',
				value: options.compositionDefaultPixelFormat,
			};
		}

		if (currentPixelFormat !== DEFAULT_PIXEL_FORMAT) {
			return {
				source: 'Config file',
				value: currentPixelFormat,
			};
		}

		return {
			source: 'default',
			value: DEFAULT_PIXEL_FORMAT,
		};
	},
	setConfig: (value) => {
		if (!validPixelFormats.includes(value)) {
			throw new TypeError(`Value ${value} is not valid as a pixel format.`);
		}

		currentPixelFormat = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<PixelFormat>;
