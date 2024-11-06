import type {AnyRemotionOption} from './option';

export const hardwareAccelerationOptions = [
	'disable',
	'if-possible',
	'force',
] as const;

export type HardwareAccelerationOption =
	(typeof hardwareAccelerationOptions)[number];

const cliFlag = 'hardware-acceleration' as const;

let currentValue: HardwareAccelerationOption | null = null;

export const getHardwareAcceleration = () => {
	return currentValue;
};

export const hardwareAccelerationOption = {
	name: 'Hardware Acceleration',
	cliFlag,
	description: () => (
		<>
			Encode using a hardware-accelerated encoder if available. If set to
			"force" and no hardware-accelerated encoder is available, then the render
			will fail.
		</>
	),
	ssrName: 'hardwareAcceleration',
	docLink: 'https://www.remotion.dev/docs/encoding',
	type: 'disable' as HardwareAccelerationOption,
	getValue: ({commandLine}) => {
		if (commandLine[cliFlag] !== undefined) {
			const value = commandLine[cliFlag] as HardwareAccelerationOption;
			if (!hardwareAccelerationOptions.includes(value)) {
				throw new Error(`Invalid value for --${cliFlag}: ${value}`);
			}

			return {
				source: 'cli',
				value,
			};
		}

		if (currentValue !== null) {
			return {
				source: 'config',
				value: currentValue,
			};
		}

		return {
			source: 'default',
			value: 'disable',
		};
	},
	setConfig: (value: HardwareAccelerationOption) => {
		if (!hardwareAccelerationOptions.includes(value)) {
			throw new Error(`Invalid value for --${cliFlag}: ${value}`);
		}

		currentValue = value;
	},
} satisfies AnyRemotionOption<HardwareAccelerationOption>;
