import React from 'react';
import {Internals, useRemotionEnvironment} from 'remotion';
import {AudioForPreview} from './audio-for-preview';
import {AudioForRendering} from './audio-for-rendering';
import type {AudioProps} from './props';

const {validateMediaProps} = Internals;

export const Audio: React.FC<AudioProps> = (props) => {
	// Should only destruct `trimBefore` and `trimAfter` from props,
	// rest gets drilled down
	const {name, stack, showInTimeline, loop, ...otherProps} = props;
	const environment = useRemotionEnvironment();

	if (typeof props.src !== 'string') {
		throw new TypeError(
			`The \`<Audio>\` tag requires a string for \`src\`, but got ${JSON.stringify(
				props.src,
			)} instead.`,
		);
	}

	validateMediaProps(
		{playbackRate: props.playbackRate, volume: props.volume},
		'Audio',
	);

	if (environment.isRendering) {
		return <AudioForRendering {...otherProps} />;
	}

	const {...propsForPreview} = otherProps;

	return (
		<AudioForPreview
			loop={loop}
			name={name}
			{...propsForPreview}
			stack={stack ?? null}
		/>
	);
};

// TODO: Doesn't work
Internals.addSequenceStackTraces(Audio);
