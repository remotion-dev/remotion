import type {AnyRemotionOption} from './option';

let gopSize: number | null = null;

export const validateGopSize = (value: number | null) => {
	if (value === null) {
		return;
	}

	if (
		typeof value !== 'number' ||
		!Number.isFinite(value) ||
		!Number.isInteger(value) ||
		value <= 0
	) {
		throw new TypeError(
			'The GOP size must be an integer greater than 0 or null.',
		);
	}
};

const cliFlag = 'gop' as const;

export const gopSizeOption = {
	name: 'GOP size',
	cliFlag,
	description: () => (
		<>
			Set the maximum number of frames between two keyframes. This maps to
			FFmpeg&apos;s <code>-g</code> option. Default: Let the encoder decide.
		</>
	),
	ssrName: 'gopSize',
	docLink: 'https://www.remotion.dev/docs/config#setgopsize',
	type: null as number | null,
	getValue: ({commandLine}) => {
		const value = commandLine[cliFlag];
		if (value !== undefined) {
			validateGopSize(value as number);
			return {value: value as number, source: 'cli'};
		}

		return {value: gopSize, source: gopSize === null ? 'default' : 'config'};
	},
	setConfig: (value) => {
		validateGopSize(value);
		gopSize = value;
	},
	id: cliFlag,
} satisfies AnyRemotionOption<number | null>;
