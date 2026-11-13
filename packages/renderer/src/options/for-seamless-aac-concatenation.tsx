import type {AnyRemotionOption} from './option';

const DEFAULT = false;

let forSeamlessAacConcatenation = DEFAULT;

export const getForSeamlessAacConcatenation = () => {
	return forSeamlessAacConcatenation;
};

const cliFlag = 'for-seamless-aac-concatenation' as const;

export const forSeamlessAacConcatenationOption = {
	name: 'For seamless AAC concatenation',
	addedIn: '4.0.123',
	cliFlag,
	description: () => (
		<>
			If enabled, the audio is trimmed to the nearest AAC frame, which is
			required for seamless concatenation of AAC files. This is a requirement if
			you later want to combine multiple video snippets seamlessly.
			<br />
			<br /> See <a href="/docs/distributed-rendering">
				Distributed rendering
			</a>{' '}
			and{' '}
			<a href="/docs/renderer/combine-chunks">
				<code>combineChunks()</code>
			</a>{' '}
			for how to concatenate the chunks.
		</>
	),
	docLink:
		'https://www.remotion.dev/docs/options/for-seamless-aac-concatenation',
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
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
