import type {StillImageFormat} from '../image-format';
import {validStillImageFormats} from '../image-format';
import type {AnyRemotionOption} from './option';

let currentStillImageFormat: StillImageFormat | null = null;

const cliFlag = 'image-format' as const;

export const stillImageFormatOption = {
	name: 'Still Image Format',
	cliFlag,
	description: () => (
		<>
			The image format to use when rendering a still. Must be one of{' '}
			{validStillImageFormats.map((f) => `"${f}"`).join(', ')}. Default:{' '}
			<code>&quot;png&quot;</code>.
		</>
	),
	ssrName: 'imageFormat' as const,
	docLink: 'https://www.remotion.dev/docs/renderer/render-still#imageformat',
	type: null as StillImageFormat | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const value = commandLine[cliFlag] as StillImageFormat;
			if (
				!(validStillImageFormats as readonly string[]).includes(value as string)
			) {
				throw new Error(
					`Invalid still image format: ${value}. Must be one of: ${validStillImageFormats.join(', ')}`,
				);
			}

			return {
				source: 'cli',
				value,
			};
		}

		if (currentStillImageFormat !== null) {
			return {
				source: 'config',
				value: currentStillImageFormat,
			};
		}

		return {
			source: 'default',
			value: null,
		};
	},
	setConfig: (value) => {
		if (value === null) {
			currentStillImageFormat = null;
			return;
		}

		if (
			!(validStillImageFormats as readonly string[]).includes(value as string)
		) {
			throw new TypeError(
				[
					`Value ${value} is not valid as a still image format.`,
					// @ts-expect-error
					value === 'jpg' ? 'Did you mean "jpeg"?' : null,
				]
					.filter(Boolean)
					.join(' '),
			);
		}

		currentStillImageFormat = value;
	},
	id: 'still-image-format',
} satisfies AnyRemotionOption<StillImageFormat | null>;
