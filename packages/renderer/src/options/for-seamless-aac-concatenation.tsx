import type {AnyRemotionOption} from './option';

const DEFAULT = false;

let forSeamlessAacConcatenation = DEFAULT;

export const getForSeamlessAacConcatenation = () => {
	return forSeamlessAacConcatenation;
};

const cliFlag = 'for-seamless-aac-concatenation' as const;

export const forSeamlessAacConcatenationOption = {
	name: 'For seamless AAC concatenation',
	cliFlag,
	description: () => (
		<>
			If enabled, the audio is trimmed to the nearest AAC frame, which is
			required for seamless concatenation of AAC files. This is a requirement if
			you later want to combine multiple video snippets seamlessly.
			<br />
			<br /> This option is used internally. There is currently no documentation
			yet for to concatenate the audio chunks.
		</>
	),
	docLink: 'https://remotion.dev/docs/renderer',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag]) {
			return {
				source: 'cli',
				value: true,
			};
		}

		if (forSeamlessAacConcatenation !== DEFAULT) {
			return {
				source: 'config',
				value: forSeamlessAacConcatenation,
			};
		}

		return {
			source: 'default',
			value: DEFAULT,
		};
	},
	setConfig: (value) => {
		forSeamlessAacConcatenation = value;
	},
	ssrName: 'forSeamlessAacConcatenation',
	type: false as boolean,
} satisfies AnyRemotionOption<boolean>;
