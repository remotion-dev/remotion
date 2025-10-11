/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {forwardRef, useCallback, useContext} from 'react';
import {Sequence} from '../Sequence.js';
import {getAbsoluteSrc} from '../absolute-src.js';
import {calculateMediaDuration} from '../calculate-media-duration.js';
import {cancelRender} from '../cancel-render.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {Loop} from '../loop/index.js';
import {usePreload} from '../prefetch.js';
import {useRemotionEnvironment} from '../use-remotion-environment.js';
import {useVideoConfig} from '../use-video-config.js';
import {validateMediaProps} from '../validate-media-props.js';
import {
	resolveTrimProps,
	validateMediaTrimProps,
} from '../validate-start-from-props.js';
import {DurationsContext} from '../video/duration-state.js';
import {AudioForPreview} from './AudioForPreview.js';
import {AudioForRendering} from './AudioForRendering.js';
import type {RemotionAudioProps, RemotionMainAudioProps} from './props.js';
import {SharedAudioContext} from './shared-audio-tags.js';

const AudioRefForwardingFunction: React.ForwardRefRenderFunction<
	HTMLAudioElement,
	RemotionAudioProps &
		RemotionMainAudioProps & {
			/**
			 * @deprecated For internal use only
			 */
			readonly stack?: string;
		}
> = (props, ref) => {
	const audioContext = useContext(SharedAudioContext);
	const {
		startFrom,
		endAt,
		trimBefore,
		trimAfter,
		name,
		stack,
		pauseWhenBuffering,
		showInTimeline,
		onError: onRemotionError,
		...otherProps
	} = props;
	const {loop, ...propsOtherThanLoop} = props;
	const {fps} = useVideoConfig();
	const environment = useRemotionEnvironment();

	const {durations, setDurations} = useContext(DurationsContext);
	if (typeof props.src !== 'string') {
		throw new TypeError(
			`The \`<Html5Audio>\` tag requires a string for \`src\`, but got ${JSON.stringify(
				props.src,
			)} instead.`,
		);
	}

	const preloadedSrc = usePreload(props.src);

	const onError: React.ReactEventHandler<HTMLAudioElement> = useCallback(
		(e) => {
			// eslint-disable-next-line no-console
			console.log(e.currentTarget.error);

			// If there is no `loop` property, we don't need to get the duration
			// and this does not need to be a fatal error
			const errMessage = `Could not play audio with src ${preloadedSrc}: ${e.currentTarget.error}. See https://remotion.dev/docs/media-playback-error for help.`;

			if (loop) {
				if (onRemotionError) {
					onRemotionError(new Error(errMessage));
					return;
				}

				cancelRender(new Error(errMessage));
			} else {
				onRemotionError?.(new Error(errMessage));
				// eslint-disable-next-line no-console
				console.warn(errMessage);
			}
		},
		[loop, onRemotionError, preloadedSrc],
	);

	const onDuration = useCallback(
		(src: string, durationInSeconds: number) => {
			setDurations({type: 'got-duration', durationInSeconds, src});
		},
		[setDurations],
	);

	const durationFetched =
		durations[getAbsoluteSrc(preloadedSrc)] ??
		durations[getAbsoluteSrc(props.src)];

	validateMediaTrimProps({startFrom, endAt, trimBefore, trimAfter});

	const {trimBeforeValue, trimAfterValue} = resolveTrimProps({
		startFrom,
		endAt,
		trimBefore,
		trimAfter,
	});

	if (loop && durationFetched !== undefined) {
		if (!Number.isFinite(durationFetched)) {
			return (
				<Html5Audio
					{...propsOtherThanLoop}
					ref={ref}
					_remotionInternalNativeLoopPassed
				/>
			);
		}

		const duration = durationFetched * fps;

		return (
			<Loop
				layout="none"
				durationInFrames={calculateMediaDuration({
					trimAfter: trimAfterValue,
					mediaDurationInFrames: duration,
					playbackRate: props.playbackRate ?? 1,
					trimBefore: trimBeforeValue,
				})}
			>
				<Html5Audio
					{...propsOtherThanLoop}
					ref={ref}
					_remotionInternalNativeLoopPassed
				/>
			</Loop>
		);
	}

	if (
		typeof trimBeforeValue !== 'undefined' ||
		typeof trimAfterValue !== 'undefined'
	) {
		return (
			<Sequence
				layout="none"
				from={0 - (trimBeforeValue ?? 0)}
				showInTimeline={false}
				durationInFrames={trimAfterValue}
				name={name}
			>
				<Html5Audio
					_remotionInternalNeedsDurationCalculation={Boolean(loop)}
					pauseWhenBuffering={pauseWhenBuffering ?? false}
					{...otherProps}
					ref={ref}
				/>
			</Sequence>
		);
	}

	validateMediaProps(
		{playbackRate: props.playbackRate, volume: props.volume},
		'Html5Audio',
	);

	if (environment.isRendering) {
		return (
			<AudioForRendering
				onDuration={onDuration}
				{...props}
				ref={ref}
				onNativeError={onError}
				_remotionInternalNeedsDurationCalculation={Boolean(loop)}
			/>
		);
	}

	return (
		<AudioForPreview
			_remotionInternalNativeLoopPassed={
				props._remotionInternalNativeLoopPassed ?? false
			}
			_remotionInternalStack={stack ?? null}
			shouldPreMountAudioTags={
				audioContext !== null && audioContext.numberOfAudioTags > 0
			}
			{...props}
			ref={ref}
			onNativeError={onError}
			onDuration={onDuration}
			// Proposal: Make this default to true in v5
			pauseWhenBuffering={pauseWhenBuffering ?? false}
			_remotionInternalNeedsDurationCalculation={Boolean(loop)}
			showInTimeline={showInTimeline ?? true}
		/>
	);
};

/**
 * @description With this component, you can add audio to your video. All audio formats which are supported by Chromium are supported by the component.
 * @see [Documentation](https://remotion.dev/docs/html5-audio)
 */
export const Html5Audio = forwardRef(AudioRefForwardingFunction);
addSequenceStackTraces(Html5Audio);

/**
 * @deprecated This component has been renamed to `Html5Audio`.
 * @see [Documentation](https://remotion.dev/docs/mediabunny/new-video)
 */
export const Audio = Html5Audio;
