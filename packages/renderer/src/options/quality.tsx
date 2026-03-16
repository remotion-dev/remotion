import type {AnyRemotionOption} from './option';

const cliFlag = 'quality' as const;

export const qualityOption = {
	name: 'Quality (deprecated)',
	cliFlag,
	description: () => (
		<>
			<strong>Deprecated alias.</strong> Use <code>--jpeg-quality</code> instead.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/cli/render',
	type: 0 as number,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as number,
			};
		}

		return {
			source: 'default',
			value: 0,
		};
	},
	setConfig: () => {
		throw new Error(
			'The --quality flag is deprecated. Use --jpeg-quality or Config.setJpegQuality() instead.',
		);
	},
	id: cliFlag,
} satisfies AnyRemotionOption<number>;
