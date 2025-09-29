import React from 'react';
import {Internals, Sequence, useRemotionEnvironment} from 'remotion';
import type {VideoProps} from './props';
import {NewVideoForPreview} from './video-for-preview';
import {VideoForRendering} from './video-for-rendering';

const {validateMediaTrimProps, resolveTrimProps, validateMediaProps} =
	Internals;

export const Video: React.FC<VideoProps> = (props) => {
	// Should only destruct `trimBefore` and `trimAfter` from props,
	// rest gets drilled down
	const {trimBefore, trimAfter, name, stack, showInTimeline, ...otherProps} =
		props;
	const environment = useRemotionEnvironment();

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
				<Video {...otherProps} />
			</Sequence>
		);
	}

	validateMediaProps(props, 'Video');

	if (environment.isRendering) {
		return <VideoForRendering {...otherProps} />;
	}

	// For preview, use our new canvas-based component
	return (
		<NewVideoForPreview
			src={otherProps.src}
			style={otherProps.style}
			playbackRate={otherProps.playbackRate}
			logLevel={otherProps.logLevel}
			muted={otherProps.muted}
			volume={otherProps.volume}
			loopVolumeCurveBehavior={otherProps.loopVolumeCurveBehavior}
			onVideoFrame={otherProps.onVideoFrame}
		/>
	);
};
