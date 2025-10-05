import React, {useCallback} from 'react';
import {Sequence} from '../Sequence.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {useRemotionEnvironment} from '../use-remotion-environment.js';
import {validateMediaProps} from '../validate-media-props.js';
import {
	resolveTrimProps,
	validateMediaTrimProps,
} from '../validate-start-from-props.js';
import {OffthreadVideoForRendering} from './OffthreadVideoForRendering.js';
import {VideoForPreview} from './VideoForPreview.js';
import type {
	AllOffthreadVideoProps,
	RemotionOffthreadVideoProps,
} from './props.js';

export const InnerOffthreadVideo: React.FC<AllOffthreadVideoProps> = (
	props,
) => {
	// Should only destruct `startFrom` and `endAt` from props,
	// rest gets drilled down
	const {
		startFrom,
		endAt,
		trimBefore,
		trimAfter,
		name,
		pauseWhenBuffering,
		stack,
		showInTimeline,
		...otherProps
	} = props;
	const environment = useRemotionEnvironment();

	const onDuration = useCallback(() => undefined, []);

	if (typeof props.src !== 'string') {
		throw new TypeError(
			`The \`<OffthreadVideo>\` tag requires a string for \`src\`, but got ${JSON.stringify(
				props.src,
			)} instead.`,
		);
	}

	validateMediaTrimProps({startFrom, endAt, trimBefore, trimAfter});

	const {trimBeforeValue, trimAfterValue} = resolveTrimProps({
		startFrom,
		endAt,
		trimBefore,
		trimAfter,
	});

	if (trimBeforeValue !== 0 || trimAfterValue !== 0) {
		return (
			<Sequence
				layout="none"
				from={0 - trimBeforeValue}
				showInTimeline={false}
				durationInFrames={trimAfterValue}
				name={name}
			>
				<InnerOffthreadVideo
					pauseWhenBuffering={pauseWhenBuffering ?? false}
					{...otherProps}
					trimAfter={undefined}
					name={undefined}
					showInTimeline={showInTimeline}
					trimBefore={undefined}
					stack={undefined}
					startFrom={undefined}
					endAt={undefined}
				/>
			</Sequence>
		);
	}

	validateMediaProps(props, 'Video');

	if (environment.isRendering) {
		return (
			<OffthreadVideoForRendering
				pauseWhenBuffering={pauseWhenBuffering ?? false}
				{...otherProps}
				trimAfter={undefined}
				name={undefined}
				showInTimeline={showInTimeline}
				trimBefore={undefined}
				stack={undefined}
				startFrom={undefined}
				endAt={undefined}
			/>
		);
	}

	const {
		transparent,
		toneMapped,
		onAutoPlayError,
		onVideoFrame,
		crossOrigin,
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		...propsForPreview
	} = otherProps;

	return (
		<VideoForPreview
			_remotionInternalStack={stack ?? null}
			onDuration={onDuration}
			onlyWarnForMediaSeekingError
			pauseWhenBuffering={pauseWhenBuffering ?? false}
			showInTimeline={showInTimeline ?? true}
			onAutoPlayError={onAutoPlayError ?? undefined}
			onVideoFrame={onVideoFrame ?? null}
			crossOrigin={crossOrigin}
			{...propsForPreview}
			_remotionInternalNativeLoopPassed={false}
		/>
	);
};

/*
 * @description This method imports and displays a video, similar to <Video />. During rendering, it extracts the exact frame from the video and displays it in an <img> tag
 * @see [Documentation](https://www.remotion.dev/docs/offthreadvideo)
 */

export const OffthreadVideo: React.FC<RemotionOffthreadVideoProps> = ({
	src,
	acceptableTimeShiftInSeconds,
	allowAmplificationDuringRender,
	audioStreamIndex,
	className,
	crossOrigin,
	delayRenderRetries,
	delayRenderTimeoutInMilliseconds,
	id,
	loopVolumeCurveBehavior,
	muted,
	name,
	onAutoPlayError,
	onError,
	onVideoFrame,
	pauseWhenBuffering,
	playbackRate,
	showInTimeline,
	style,
	toneFrequency,
	toneMapped,
	transparent,
	trimAfter,
	trimBefore,
	useWebAudioApi,
	volume,
	_remotionInternalNativeLoopPassed,
	endAt,
	stack,
	startFrom,
	imageFormat,
}) => {
	if (imageFormat) {
		throw new TypeError(
			`The \`<OffthreadVideo>\` tag does no longer accept \`imageFormat\`. Use the \`transparent\` prop if you want to render a transparent video.`,
		);
	}

	return (
		<InnerOffthreadVideo
			acceptableTimeShiftInSeconds={acceptableTimeShiftInSeconds}
			allowAmplificationDuringRender={allowAmplificationDuringRender ?? true}
			audioStreamIndex={audioStreamIndex ?? 0}
			className={className}
			crossOrigin={crossOrigin}
			delayRenderRetries={delayRenderRetries}
			delayRenderTimeoutInMilliseconds={delayRenderTimeoutInMilliseconds}
			id={id}
			loopVolumeCurveBehavior={loopVolumeCurveBehavior ?? 'repeat'}
			muted={muted ?? false}
			name={name}
			onAutoPlayError={onAutoPlayError ?? null}
			onError={onError}
			onVideoFrame={onVideoFrame}
			pauseWhenBuffering={pauseWhenBuffering ?? true}
			playbackRate={playbackRate ?? 1}
			toneFrequency={toneFrequency ?? 1}
			showInTimeline={showInTimeline ?? true}
			src={src}
			stack={stack}
			startFrom={startFrom}
			_remotionInternalNativeLoopPassed={
				_remotionInternalNativeLoopPassed ?? false
			}
			endAt={endAt}
			style={style}
			toneMapped={toneMapped ?? true}
			transparent={transparent ?? false}
			trimAfter={trimAfter}
			trimBefore={trimBefore}
			useWebAudioApi={useWebAudioApi ?? false}
			volume={volume}
		/>
	);
};

addSequenceStackTraces(OffthreadVideo);
