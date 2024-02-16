import type {Codec} from './codec';
import type {AnyRemotionOption} from './options/option';

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

export type X264Preset = (typeof x264PresetOptions)[number];

export const validateSelectedCodecAndPresetCombination = ({
	codec,
	x264Preset,
}: {
	codec: Codec;
	x264Preset: X264Preset | undefined;
}) => {
	if (
		typeof x264Preset !== 'undefined' &&
		codec !== 'h264' &&
		codec !== 'h264-mkv'
	) {
		throw new TypeError(
			`You have set a x264 preset but the codec is "${codec}". Set the codec to "h264" or remove the Preset profile.`,
		);
	}

	if (
		x264Preset !== undefined &&
		!x264PresetOptions.includes(x264Preset as X264Preset)
	) {
		throw new TypeError(
			`The Preset profile "${x264Preset}" is not valid. Valid options are ${x264PresetOptions
				.map((p) => `"${p}"`)
				.join(', ')}`,
		);
	}
};

export const x264Option = {
	name: 'x264 Preset',
	cliFlag: 'x264-preset' as const,
	description: () => (
		<>
			Sets a x264 preset profile. Only applies to videos rendered with{' '}
			<code>h264</code> codec.
			<br />
			Possible values: <code>superfast</code>, <code>veryfast</code>,{' '}
			<code>faster</code>, <code>fast</code>, <code>medium</code>,{' '}
			<code>slow</code>, <code>slower</code>, <code>veryslow</code>,{' '}
			<code>placebo</code>.<br />
			Default: <code>medium</code>
		</>
	),
	ssrName: 'x264Preset' as const,
	docLink: 'https://www.remotion.dev/docs/renderer/render-media',
	type: 'fast' as X264Preset,
} satisfies AnyRemotionOption;
