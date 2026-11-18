import type {AnyRemotionOption} from './option';

let proResBitsPerMacroblock: number | null = null;

export const validateProResBitsPerMacroblock = (value: number | null) => {
	if (value === null) {
		return;
	}

	if (!Number.isInteger(value) || value < 128 || value > 8192) {
		throw new TypeError(
			'proResBitsPerMacroblock must be an integer between 128 and 8192 or null.',
		);
	}
};

const cliFlag = 'prores-bits-per-macroblock' as const;

export const proResBitsPerMacroblockOption = {
	name: 'ProRes bits per macroblock',
	addedIn: '4.0.543',
	cliFlag,
	id: cliFlag,
	description: () => (
		<>
			Set the bit budget per macroblock for software ProRes encoding. Accepts an
			integer from 128 to 8192. Lower values can reduce file size and quality;
			higher values may produce the same output depending on the content and
			ProRes profile. Default: <code>null</code>, which lets the encoder choose
			based on the profile. This maps to FFmpeg&apos;s <code>-bits_per_mb</code>{' '}
			option for <code>prores_ks</code> and requires the <code>prores</code>{' '}
			codec. With <code>hardwareAcceleration</code> set to{' '}
			<code>if-possible</code>, encoding falls back to software;{' '}
			<code>required</code> is not supported. The ProRes profile and pixel
			format still determine the output format and alpha channel support.
		</>
	),
	ssrName: 'proResBitsPerMacroblock',
	docLink: 'https://www.remotion.dev/docs/options/prores-bits-per-macroblock',
	type: null as number | null,
	getValue: ({commandLine}) => {
		const value = commandLine[cliFlag];
		if (value !== undefined) {
			validateProResBitsPerMacroblock(value as number);
			return {value: value as number, source: 'cli'};
		}

		return {
			value: proResBitsPerMacroblock,
			source: proResBitsPerMacroblock === null ? 'default' : 'config',
		};
	},
	setConfig: (value) => {
		validateProResBitsPerMacroblock(value);
		proResBitsPerMacroblock = value;
	},
} satisfies AnyRemotionOption<number | null>;
