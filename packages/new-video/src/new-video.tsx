import React, {useCallback} from 'react';
import type {RemotionOffthreadVideoProps} from 'remotion';
import {getRemotionEnvironment, Internals, Sequence} from 'remotion';
import {NewVideoForRendering} from './newVideoForRendering';
const {
	validateMediaTrimProps,
	resolveTrimProps,
	validateMediaProps,
	VideoForPreview,
} = Internals;
/*
 * @description This method uses extractFrames() under the hood to reliably and accurately render video codecs.
 * @see [Documentation](https://www.remotion.dev/docs/newvideo)
 */
export const NewVideo: React.FC<RemotionOffthreadVideoProps> = (props) => {
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
	const environment = getRemotionEnvironment();

	const onDuration = useCallback(() => undefined, []);

	if (typeof props.src !== 'string') {
		throw new TypeError(
			`The \`<NewVideo>\` tag requires a string for \`src\`, but got ${JSON.stringify(
				props.src,
			)} instead.`,
		);
	}

	if (props.imageFormat) {
		throw new TypeError(
			`The \`<NewVideo>\` tag does no longer accept \`imageFormat\`. Use the \`transparent\` prop if you want to render a transparent video.`,
		);
	}

	validateMediaTrimProps({startFrom, endAt, trimBefore, trimAfter});

	const {trimBeforeValue, trimAfterValue} = resolveTrimProps({
		startFrom,
		endAt,
		trimBefore,
		trimAfter,
	});

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
				<NewVideo
					pauseWhenBuffering={pauseWhenBuffering ?? false}
					{...otherProps}
				/>
			</Sequence>
		);
	}

	validateMediaProps(props, 'Video');

	if (environment.isRendering) {
		return <NewVideoForRendering {...otherProps} />;
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
			_remotionInternalNativeLoopPassed={false}
			onDuration={onDuration}
			onlyWarnForMediaSeekingError
			pauseWhenBuffering={pauseWhenBuffering ?? false}
			showInTimeline={showInTimeline ?? true}
			onAutoPlayError={onAutoPlayError ?? undefined}
			onVideoFrame={onVideoFrame ?? null}
			crossOrigin={crossOrigin}
			{...propsForPreview}
		/>
	);
};
