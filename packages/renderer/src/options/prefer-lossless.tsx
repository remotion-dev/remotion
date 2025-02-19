import type {AnyRemotionOption} from './option';

const cliFlag = 'prefer-lossless' as const;

let input: boolean | null = false;

export const preferLosslessAudioOption = {
	name: 'Prefer lossless',
	cliFlag,
	description: () => (
		<>
			Uses a lossless audio codec, if one is available for the codec. If you set
			<code>audioCodec</code>, it takes priority over{' '}
			<code>preferLossless</code>.
		</>
	),
	docLink: 'https://www.remotion.dev/docs/encoding',
	type: false as boolean,
	ssrName: 'preferLossless' as const,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			return {value: true, source: 'cli'};
		}

		if (input === true) {
			return {value: true, source: 'config'};
		}

		return {value: false, source: 'default'};
	},
	setConfig: (val: boolean) => {
		input = val;
	},
} satisfies AnyRemotionOption<boolean>;
