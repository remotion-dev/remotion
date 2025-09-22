import React, {useCallback} from 'react';
import {Internals, Sequence, useRemotionEnvironment} from 'remotion';
import type {VideoProps} from './props';
import {VideoForRendering} from './video-for-rendering';

const {
	validateMediaTrimProps,
	resolveTrimProps,
	validateMediaProps,
	VideoForPreview,
} = Internals;

export const Video: React.FC<VideoProps> = (props) => {
	// Should only destruct `trimBefore` and `trimAfter` from props,
	// rest gets drilled down
	const {
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
			`The \`<Video>\` tag requires a string for \`src\`, but got ${JSON.stringify(
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
				<Video
					pauseWhenBuffering={pauseWhenBuffering ?? false}
					{...otherProps}
				/>
			</Sequence>
		);
	}

	validateMediaProps(props, 'Video');

	if (environment.isRendering) {
		return <VideoForRendering {...otherProps} />;
	}

	const {
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
