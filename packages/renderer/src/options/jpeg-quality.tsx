import {DEFAULT_JPEG_QUALITY, validateJpegQuality} from '../jpeg-quality';
import type {AnyRemotionOption} from './option';

const defaultValue = DEFAULT_JPEG_QUALITY;
let quality: number = defaultValue;

export const setJpegQuality = (q: number | undefined) => {
	validateJpegQuality(q);

	if (q === 0 || q === undefined) {
		quality = defaultValue;
		return;
	}

	quality = q;
};

export const getJpegQuality = () => quality;

const cliFlag = 'jpeg-quality' as const;

export const jpegQualityOption = {
	name: 'JPEG Quality',
	cliFlag,
	description: () => (
		<>
			Sets the quality of the generated JPEG images. Must be an integer between
			0 and 100. Default: 80.
		</>
	),
	ssrName: 'jpegQuality',
	docLink: 'https://www.remotion.dev/docs/renderer/render-media#jpeg-quality',
	type: 0 as number,
	setConfig: setJpegQuality,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			validateJpegQuality(commandLine[cliFlag]);
			return {
				source: 'cli',
				value: commandLine[cliFlag] as number,
			};
		}

		if (quality !== defaultValue) {
			return {
				source: 'config',
				value: quality,
			};
		}

		return {
			source: 'default',
			value: defaultValue,
		};
	},
} satisfies AnyRemotionOption<number>;
