import type {Codec} from '../codec';
import type {AnyRemotionOption} from './option';

export const x264PresetOptions = [
	'ultrafast',
	'superfast',
	'veryfast',
	'faster',
	'fast',
	'medium',
	'slow',
	'slower',
	'veryslow',
	'placebo',
] as const;

let preset: X264Preset | null = null;

export type X264Preset = (typeof x264PresetOptions)[number];

export const validateSelectedCodecAndPresetCombination = ({
	codec,
	x264Preset,
}: {
	codec: Codec;
	x264Preset: X264Preset | null;
}) => {
	if (
		x264Preset !== null &&
		codec !== 'h264' &&
		codec !== 'h264-mkv' &&
		codec !== 'h264-ts'
	) {
		throw new TypeError(
			`You have set a x264 preset but the codec is "${codec}". Set the codec to "h264" or remove the Preset profile.`,
		);
	}

	if (
		x264Preset !== null &&
		!x264PresetOptions.includes(x264Preset as X264Preset)
	) {
		throw new TypeError(
			`The Preset profile "${x264Preset}" is not valid. Valid options are ${x264PresetOptions
				.map((p) => `"${p}"`)
				.join(', ')}`,
		);
	}
};

const cliFlag = 'x264-preset' as const;
const DEFAULT_PRESET: X264Preset = 'medium' as const;

export const x264Option = {
	name: 'x264 Preset',
	cliFlag,
	description: () => (
		<>
			Sets a x264 preset profile. Only applies to videos rendered with{' '}
			<code>h264</code> codec.
			<br />
			Possible values: <code>superfast</code>, <code>veryfast</code>,{' '}
			<code>faster</code>, <code>fast</code>, <code>medium</code>,{' '}
			<code>slow</code>, <code>slower</code>, <code>veryslow</code>,{' '}
			<code>placebo</code>.<br />
			Default: <code>{DEFAULT_PRESET}</code>
		</>
	),
	ssrName: 'x264Preset' as const,
	docLink: 'https://www.remotion.dev/docs/renderer/render-media',
	type: 'fast' as X264Preset | null,
	getValue: ({commandLine}) => {
		const value = commandLine[cliFlag];
		if (typeof value !== 'undefined') {
			return {value: value as X264Preset, source: 'cli'};
		}

		if (preset !== null) {
			return {value: preset, source: 'config'};
		}

		return {value: null, source: 'default'};
	},
	setConfig: (profile: X264Preset | null) => {
		preset = profile;
	},
} satisfies AnyRemotionOption<X264Preset | null>;
