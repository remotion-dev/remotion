import type {AnyRemotionOption} from './option';

let imageFormat: string | null = null;

const cliFlag = 'image-format' as const;

export const imageFormatOption = {
	name: 'Image Format',
	cliFlag,
	description: () => (
		<>
			Determines which in which image format to render. Can be either{' '}
			<code>&quot;jpeg&quot;</code>, <code>&quot;png&quot;</code>,{' '}
			<code>&quot;webp&quot;</code>, <code>&quot;pdf&quot;</code>, or{' '}
			<code>&quot;none&quot;</code> depending on the render type.
		</>
	),
	ssrName: 'imageFormat' as const,
	docLink: 'https://www.remotion.dev/docs/config#setvideoimageformat',
	type: null as string | null,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {value: commandLine[cliFlag] as string, source: 'cli'};
		}

		if (imageFormat !== null) {
			return {value: imageFormat, source: 'config'};
		}

		return {value: null, source: 'default'};
	},
	setConfig(value) {
		imageFormat = value;
	},
} satisfies AnyRemotionOption<string | null>;
