import React, {useCallback, useContext} from 'react';
import {
	cancelRender,
	Internals,
	Sequence,
	useRemotionEnvironment,
} from 'remotion';
import {SharedAudioContext} from '../../../core/src/audio/shared-audio-tags';
import {AudioForRendering} from './audio-for-rendering';
import type {AudioProps} from './props';

const {
	validateMediaTrimProps,
	resolveTrimProps,
	validateMediaProps,
	AudioForPreview,
} = Internals;

// dummy function for now because onError is not supported
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const onRemotionError = (e: Error) => {};

export const Audio: React.FC<AudioProps> = (props) => {
	const audioContext = useContext(SharedAudioContext);

	// Should only destruct `trimBefore` and `trimAfter` from props,
	// rest gets drilled down
	const {
		trimBefore,
		trimAfter,
		name,
		pauseWhenBuffering,
		stack,
		showInTimeline,
		loop,
		playbackRate,
		...otherProps
	} = props;
	const environment = useRemotionEnvironment();

	const onDuration = useCallback(() => undefined, []);

	if (typeof props.src !== 'string') {
		throw new TypeError(
			`The \`<Audio>\` tag requires a string for \`src\`, but got ${JSON.stringify(
				props.src,
			)} instead.`,
		);
	}

	validateMediaTrimProps({
		startFrom: undefined,
		endAt: undefined,
		trimBefore,
		trimAfter,
	});

	const {trimBeforeValue, trimAfterValue} = resolveTrimProps({
		startFrom: undefined,
		endAt: undefined,
		trimBefore,
		trimAfter,
	});

	const onError: React.ReactEventHandler<HTMLAudioElement> = useCallback(
		(e) => {
			// eslint-disable-next-line no-console
			console.log(e.currentTarget.error);

			// If there is no `loop` property, we don't need to get the duration
			// and this does not need to be a fatal error
			const errMessage = `Could not play audio: ${e.currentTarget.error}. See https://remotion.dev/docs/media-playback-error for help.`;

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
		[loop],
	);

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
				<Audio
					pauseWhenBuffering={pauseWhenBuffering ?? false}
					{...otherProps}
				/>
			</Sequence>
		);
	}

	validateMediaProps(props, 'Video');

	if (environment.isRendering) {
		return <AudioForRendering {...otherProps} />;
	}

	const {
		delayRenderRetries,
		delayRenderTimeoutInMilliseconds,
		...propsForPreview
	} = otherProps;

	return (
		<AudioForPreview
			_remotionInternalNativeLoopPassed={
				props._remotionInternalNativeLoopPassed ?? false
			}
			_remotionInternalStack={stack ?? null}
			shouldPreMountAudioTags={
				audioContext !== null && audioContext.numberOfAudioTags > 0
			}
			{...propsForPreview}
			onNativeError={onError}
			onDuration={onDuration}
			// Proposal: Make this default to true in v5
			pauseWhenBuffering={pauseWhenBuffering ?? false}
			_remotionInternalNeedsDurationCalculation={Boolean(loop)}
			showInTimeline={showInTimeline ?? true}
			playbackRate={playbackRate}
		/>
	);
};
