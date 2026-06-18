import React, {useMemo, useState} from 'react';
import {
	Internals,
	Interactive,
	Sequence,
	useRemotionEnvironment,
	useVideoConfig,
	type SequenceControls,
	type InteractivitySchema,
} from 'remotion';
import {getLoopDisplay} from '../show-in-timeline';
import {AudioForPreview} from './audio-for-preview';
import {AudioForRendering} from './audio-for-rendering';
import type {AudioProps} from './props';

const {validateMediaProps} = Internals;

const audioSchema = {
	...Internals.baseSchema,
	volume: {
		type: 'number',
		min: 0,
		max: 20,
		step: 0.01,
		default: 1,
		description: 'Volume',
		hiddenFromList: false,
	},
	playbackRate: {
		type: 'number',
		min: 0.1,
		step: 0.01,
		default: 1,
		description: 'Playback rate',
		hiddenFromList: false,
		keyframable: false,
	},
	loop: {type: 'boolean', default: false, description: 'Loop'},
} as const satisfies InteractivitySchema;

const AudioInner: React.FC<
	AudioProps & {
		readonly controls: SequenceControls | undefined;
	}
> = (props) => {
	// Should only destruct `trimBefore` and `trimAfter` from props,
	// rest gets drilled down
	const {
		name,
		stack,
		showInTimeline,
		controls,
		from,
		durationInFrames,
		freeze,
		hidden,
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
			freeze={freeze}
			_remotionInternalStack={stack}
			_remotionInternalIsMedia={isMedia}
			name={name ?? '<Audio>'}
			_remotionInternalDocumentationLink={
				name === undefined
					? 'https://www.remotion.dev/docs/media/audio'
					: undefined
			}
			controls={controls}
			_remotionInternalLoopDisplay={loopDisplay}
			showInTimeline={showInTimeline ?? true}
			hidden={hidden}
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

export const Audio = Interactive.withSchema({
	Component: AudioInner,
	componentName: '<Audio>',
	componentIdentity: 'dev.remotion.media.Audio',
	schema: audioSchema,
	supportsEffects: false,
});

Internals.addSequenceStackTraces(Audio);
