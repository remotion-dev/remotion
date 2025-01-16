/* eslint-disable @typescript-eslint/no-use-before-define */
import React, {forwardRef, useCallback, useContext} from 'react';
import {Sequence} from '../Sequence.js';
import {getAbsoluteSrc} from '../absolute-src.js';
import {calculateLoopDuration} from '../calculate-loop.js';
import {cancelRender} from '../cancel-render.js';
import {addSequenceStackTraces} from '../enable-sequence-stack-traces.js';
import {getRemotionEnvironment} from '../get-remotion-environment.js';
import {Loop} from '../loop/index.js';
import {usePreload} from '../prefetch.js';
import {useVideoConfig} from '../use-video-config.js';
import {validateMediaProps} from '../validate-media-props.js';
import {validateStartFromProps} from '../validate-start-from-props.js';
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
		name,
		stack,
		pauseWhenBuffering,
		showInTimeline,
		...otherProps
	} = props;
	const {loop, ...propsOtherThanLoop} = props;
	const {fps} = useVideoConfig();
	const environment = getRemotionEnvironment();

	const {durations, setDurations} = useContext(DurationsContext);
	if (typeof props.src !== 'string') {
		throw new TypeError(
			`The \`<Audio>\` tag requires a string for \`src\`, but got ${JSON.stringify(
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
				cancelRender(new Error(errMessage));
			} else {
				// eslint-disable-next-line no-console
				console.warn(errMessage);
			}
		},
		[loop, preloadedSrc],
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

	if (loop && durationFetched !== undefined) {
		if (!Number.isFinite(durationFetched)) {
			return (
				<Audio
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
				durationInFrames={calculateLoopDuration({
					endAt,
					mediaDuration: duration,
					playbackRate: props.playbackRate ?? 1,
					startFrom,
				})}
			>
				<Audio
					{...propsOtherThanLoop}
					ref={ref}
					_remotionInternalNativeLoopPassed
				/>
			</Loop>
		);
	}

	if (typeof startFrom !== 'undefined' || typeof endAt !== 'undefined') {
		validateStartFromProps(startFrom, endAt);

		const startFromFrameNo = startFrom ?? 0;
		const endAtFrameNo = endAt ?? Infinity;
		return (
			<Sequence
				layout="none"
				from={0 - startFromFrameNo}
				showInTimeline={false}
				durationInFrames={endAtFrameNo}
				name={name}
			>
				<Audio
					_remotionInternalNeedsDurationCalculation={Boolean(loop)}
					pauseWhenBuffering={pauseWhenBuffering ?? false}
					{...otherProps}
					ref={ref}
				/>
			</Sequence>
		);
	}

	validateMediaProps(props, 'Audio');

	if (environment.isRendering) {
		return (
			<AudioForRendering
				onDuration={onDuration}
				{...props}
				ref={ref}
				onError={onError}
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
			onError={onError}
			onDuration={onDuration}
			// Proposal: Make this default to true in v5
			pauseWhenBuffering={pauseWhenBuffering ?? false}
			_remotionInternalNeedsDurationCalculation={Boolean(loop)}
			showInTimeline={showInTimeline ?? true}
		/>
	);
};

/*
 * @description With this component, you can add audio to your video. All audio formats which are supported by Chromium are supported by the component.
 * @see [Documentation](https://remotion.dev/docs/audio)
 */
export const Audio = forwardRef(AudioRefForwardingFunction);

addSequenceStackTraces(Audio);
