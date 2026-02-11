import type {AnyRemotionOption} from './option';

let numberOfSharedAudioTags = 0;

const cliFlag = 'number-of-shared-audio-tags' as const;

export const numberOfSharedAudioTagsOption = {
	name: 'Number of shared audio tags',
	cliFlag,
	description: () => (
		<>
			Set number of shared audio tags. See{' '}
			<a href="https://www.remotion.dev/docs/player/autoplay#using-the-numberofsharedaudiotags-prop">
				Using the numberOfSharedAudioTags prop
			</a>{' '}
			for more information.
		</>
	),
	ssrName: null,
	docLink:
		'https://www.remotion.dev/docs/config#setnumberofsharedaudiotags',
	type: 0 as number,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				value: commandLine[cliFlag] as number,
				source: 'cli',
			};
		}

		return {
			value: numberOfSharedAudioTags,
			source: 'config',
		};
	},
	setConfig(value: number) {
		numberOfSharedAudioTags = value;
	},
} satisfies AnyRemotionOption<number>;
