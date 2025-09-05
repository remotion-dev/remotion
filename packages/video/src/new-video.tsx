import React from 'react';
import {Internals, Sequence, useRemotionEnvironment} from 'remotion';
import {NewVideoForPreview} from './new-video-for-preview';
import {NewVideoForRendering} from './new-video-for-rendering';
import type {NewVideoProps} from './props';

const {validateMediaTrimProps, resolveTrimProps, validateMediaProps} =
	Internals;

export const NewVideo: React.FC<NewVideoProps> = (props) => {
	// Should only destruct `startFrom` and `endAt` from props,
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

	if (typeof props.src !== 'string') {
		throw new TypeError(
			`The \`<NewVideo>\` tag requires a string for \`src\`, but got ${JSON.stringify(
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

	// For preview, use our new canvas-based component
	return (
		<NewVideoForPreview
			src={otherProps.src}
			style={otherProps.style}
			playbackRate={otherProps.playbackRate}
			logLevel={otherProps.logLevel}
		/>
	);
};
