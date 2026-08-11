import type {AnyRemotionOption} from './option';

const cliFlag = 'sequence' as const;

let imageSequence = false;

export const imageSequenceOption = {
	name: 'Image Sequence',
	cliFlag,
	description: () => (
		<>
			Pass this flag to output an image sequence instead of a video. The default
			image format is JPEG. See{' '}
			<a href="/docs/config#setimagesequence">
				<code>setImageSequence()</code>
			</a>{' '}
			for more details.
		</>
	),
	ssrName: null,
	docLink: 'https://www.remotion.dev/docs/config#setimagesequence',
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined && commandLine[cliFlag] !== null) {
			return {
				source: 'cli',
				value: Boolean(commandLine[cliFlag]),
			};
		}

		return {
			source: imageSequence ? 'config' : 'default',
			value: imageSequence,
		};
	},
	setConfig: (value: boolean) => {
		imageSequence = value;
	},
	type: false as boolean,
	id: cliFlag,
} satisfies AnyRemotionOption<boolean>;
