import React from 'react';
import {Internals, Sequence, useRemotionEnvironment} from 'remotion';
import {AudioForPreview} from './audio-for-preview';
import {AudioForRendering} from './audio-for-rendering';
import type {AudioProps} from './props';

const {validateMediaTrimProps, resolveTrimProps, validateMediaProps} = Internals;

export const Audio: React.FC<AudioProps> = (props) => {
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
		...otherProps
	} = props;
	const environment = useRemotionEnvironment();

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

	validateMediaProps(
		{playbackRate: props.playbackRate, volume: props.volume},
		'Audio',
	);

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
			loop={loop}
			name={name}
			{...propsForPreview}
		/>
	);
};
