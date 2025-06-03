import type {AnyRemotionOption} from './option';

const cliFlag = 'image-sequence-pattern' as const;

// Option for --image-sequence-pattern
export const imageSequencePatternOption = {
	name: 'Image Sequence Pattern',
	cliFlag,
	ssrName: 'imageSequencePattern',
	description: () => (
		<>
			Pattern for naming image sequence files. Supports <code>[frame]</code> for
			the zero-padded frame number and <code>[ext]</code> for the file
			extension.
		</>
	),
	docLink: null,
	type: 'string' as string | null,
	getValue: ({commandLine}) => ({
		value: commandLine[cliFlag] as string,
		source: 'cli',
	}),
	setConfig: () => {},
} satisfies AnyRemotionOption<string | null>;
