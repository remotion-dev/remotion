import type {AnyRemotionOption} from './option';

type Scale = number;

let currentScale: Scale | null = 1;

const cliFlag = 'scale' as const;

const validateScale = (value: unknown) => {
	if (typeof value !== 'number') {
		throw new Error('scale must be a number.');
	}
};

export const scaleOption = {
	name: 'Scale',
	cliFlag,
	description: () => (
		<>
			Scales the output dimensions by a factor. For example, a 1280x720px frame
			will become a 1920x1080px frame with a scale factor of <code>1.5</code>.
			See <a href="https://www.remotion.dev/docs/scaling">Scaling</a> for more
			details.
		</>
	),
	ssrName: 'scale',
	docLink: 'https://www.remotion.dev/docs/scaling',
	type: 0 as number,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			validateScale(commandLine[cliFlag]);
			return {
				source: 'cli',
				value: commandLine[cliFlag] as number,
			};
		}

		if (currentScale !== null) {
			return {
				source: 'config',
				value: currentScale,
			};
		}

		return {
			source: 'default',
			value: 1,
		};
	},
	setConfig: (scale) => {
		currentScale = scale;
	},
} satisfies AnyRemotionOption<number>;
