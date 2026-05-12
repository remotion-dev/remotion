import {useState} from 'react';
import React from 'react';
import {useMemo} from 'react';
import {
	useVideoConfig,
	type SequenceControls,
	type SequenceSchema,
} from 'remotion';
import {Internals, Sequence, useRemotionEnvironment} from 'remotion';
import {getLoopDisplay} from '../show-in-timeline';
import {AudioForPreview} from './audio-for-preview';
import {AudioForRendering} from './audio-for-rendering';
import type {AudioProps} from './props';

const {validateMediaProps} = Internals;

const audioSchema = {
	volume: {
		type: 'number',
		min: 0,
		max: 20,
		step: 0.01,
		default: 1,
		description: 'Volume',
	},
	playbackRate: {
		type: 'number',
		min: 0.1,
		step: 0.01,
		default: 1,
		description: 'Playback Rate',
	},
	loop: {type: 'boolean', default: false, description: 'Loop'},
} as const satisfies SequenceSchema;

const AudioInner: React.FC<
	AudioProps & {
		readonly _experimentalControls: SequenceControls | undefined;
	}
> = (props) => {
	// Should only destruct `trimBefore` and `trimAfter` from props,
	// rest gets drilled down
	const {
		name,
		stack,
		showInTimeline,
		_experimentalControls: controls,
		from,
		durationInFrames,
		...otherProps
	} = props;
	const environment = useRemotionEnvironment();

	const [mediaVolume] = Internals.useMediaVolumeState();
	const mediaStartsAt = Internals.useMediaStartsAt();
	const videoConfig = useVideoConfig();
	const sequenceDurationInFrames = Math.min(
		durationInFrames ?? Infinity,
		Math.max(0, videoConfig.durationInFrames - (from ?? 0)),
	);

	const basicInfo = Internals.useBasicMediaInTimeline({
		src: props.src,
		volume: props.volume,
		playbackRate: props.playbackRate ?? 1,
		trimBefore: props.trimBefore,
		trimAfter: props.trimAfter,
		sequenceDurationInFrames,
		mediaType: 'audio',
		displayName: name ?? '<Audio>',
		mediaVolume,
		mediaStartsAt,
		loop: props.loop ?? false,
	});

	// TODO: Redundant with what we do in the Studio
	const [mediaDurationInSeconds, setMediaDurationInSeconds] = useState<
		number | null
	>(null);

	const loopDisplay = useMemo(
		() =>
			getLoopDisplay({
				loop: props.loop ?? false,
				mediaDurationInSeconds,
				playbackRate: props.playbackRate ?? 1,
				trimAfter: props.trimAfter,
				trimBefore: props.trimBefore,
				sequenceDurationInFrames,
				compFps: videoConfig.fps,
			}),
		[
			props.loop,
			mediaDurationInSeconds,
			props.playbackRate,
			props.trimAfter,
			props.trimBefore,
			sequenceDurationInFrames,
			videoConfig.fps,
		],
	);

	const isMedia = useMemo(
		() => ({
			type: 'audio' as const,
			data: basicInfo,
		}),
		[basicInfo],
	);

	if (typeof props.src !== 'string') {
		throw new TypeError(
			`The \`<Audio>\` tag requires a string for \`src\`, but got ${JSON.stringify(
				props.src,
			)} instead.`,
		);
	}

	validateMediaProps(
		{playbackRate: props.playbackRate, volume: props.volume},
		'Audio',
	);

	if (sequenceDurationInFrames === 0) {
		return null;
	}

	return (
		<Sequence
			layout="none"
			from={from ?? 0}
			durationInFrames={basicInfo.duration}
			_remotionInternalStack={stack}
			_remotionInternalIsMedia={isMedia}
			name={name ?? '<Audio>'}
			_experimentalControls={controls}
			_remotionInternalLoopDisplay={loopDisplay}
			showInTimeline={showInTimeline ?? true}
		>
			{environment.isRendering ? (
				<AudioForRendering {...otherProps} />
			) : (
				<AudioForPreview
					name={name}
					{...otherProps}
					stack={stack ?? null}
					setMediaDurationInSeconds={setMediaDurationInSeconds}
				/>
			)}
		</Sequence>
	);
};

export const Audio = Internals.wrapInSchema(AudioInner, audioSchema);

Internals.addSequenceStackTraces(Audio);
