import React, {useCallback} from 'react';
import {Sequence} from '../Sequence.js';
import {getRemotionEnvironment} from '../get-remotion-environment.js';
import {validateMediaProps} from '../validate-media-props.js';
import {validateStartFromProps} from '../validate-start-from-props.js';
import {OffthreadVideoForRendering} from './OffthreadVideoForRendering.js';
import {VideoForPreview} from './VideoForPreview.js';
import type {OffthreadVideoProps} from './props.js';

/*
 * @description This method imports and displays a video, similar to <Video />. During rendering, it extracts the exact frame from the video and displays it in an <img> tag
 * @see [Documentation](https://www.remotion.dev/docs/offthreadvideo)
 */
export const OffthreadVideo: React.FC<OffthreadVideoProps> = (props) => {
	// Should only destruct `startFrom` and `endAt` from props,
	// rest gets drilled down
	const {
		startFrom,
		endAt,
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
			`The \`<OffthreadVideo>\` tag requires a string for \`src\`, but got ${JSON.stringify(
				props.src,
			)} instead.`,
		);
	}

	if (props.imageFormat) {
		throw new TypeError(
			`The \`<OffthreadVideo>\` tag does no longer accept \`imageFormat\`. Use the \`transparent\` prop if you want to render a transparent video.`,
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
				<OffthreadVideo
					pauseWhenBuffering={pauseWhenBuffering ?? false}
					{...otherProps}
				/>
			</Sequence>
		);
	}

	validateMediaProps(props, 'Video');

	if (environment.isRendering) {
		return <OffthreadVideoForRendering {...otherProps} />;
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
