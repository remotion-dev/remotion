import type {AnyRemotionOption} from './option';

const DEFAULT_EVERY_NTH_FRAME = 1;

let everyNthFrame = DEFAULT_EVERY_NTH_FRAME;

const cliFlag = 'every-nth-frame' as const;

export const everyNthFrameOption = {
	name: 'Every nth frame',
	cliFlag,
	description: () => (
		<>
			This option may only be set when rendering GIFs. It determines how many
			frames are rendered, while the other ones get skipped in order to lower
			the FPS of the GIF. For example, if the <code>fps</code> is 30, and{' '}
			<code>everyNthFrame</code> is 2, the FPS of the GIF is <code>15</code>.
		</>
	),
	ssrName: 'everyNthFrame' as const,
	docLink: 'https://www.remotion.dev/docs/config#seteverynthframe',
	type: DEFAULT_EVERY_NTH_FRAME as number,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			return {
				source: 'cli',
				value: commandLine[cliFlag] as number,
			};
		}

		if (everyNthFrame !== DEFAULT_EVERY_NTH_FRAME) {
			return {
				source: 'config',
				value: everyNthFrame,
			};
		}

		return {
			source: 'default',
			value: DEFAULT_EVERY_NTH_FRAME,
		};
	},
	setConfig: (value) => {
		everyNthFrame = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<number>;
