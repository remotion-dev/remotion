import type {AnyRemotionOption} from './option';

let disallowParallelEncoding = false;

const cliFlag = 'disallow-parallel-encoding' as const;

export const disallowParallelEncodingOption = {
	name: 'Disallow parallel encoding',
	cliFlag,
	description: () => (
		<>
			Disallows the renderer from doing rendering frames and encoding at the
			same time. This makes the rendering process more memory-efficient, but
			possibly slower.
		</>
	),
	ssrName: 'disallowParallelEncoding',
	docLink: 'https://www.remotion.dev/docs/config#setdisallowparallelencoding',
	type: false as boolean,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				value: commandLine[cliFlag] as boolean,
				source: 'cli',
			};
		}

		if (disallowParallelEncoding !== false) {
			return {
				value: disallowParallelEncoding,
				source: 'config',
			};
		}

		return {
			value: false,
			source: 'default',
		};
	},
	setConfig(value) {
		disallowParallelEncoding = value;
	},
} satisfies AnyRemotionOption<boolean>;
