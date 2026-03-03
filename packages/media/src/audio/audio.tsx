import React from 'react';
import type {SequenceControls, SequenceSchema} from 'remotion';
import {Internals, useRemotionEnvironment} from 'remotion';
import {AudioForPreview} from './audio-for-preview';
import {AudioForRendering} from './audio-for-rendering';
import type {AudioProps} from './props';

const {validateMediaProps} = Internals;

const audioSchema = {
	volume: {
		type: 'number',
		min: 0,
		max: 20,
		step: 0.01,
		default: 1,
		description: 'Volume',
	},
	playbackRate: {
		type: 'number',
		min: 0.1,
		step: 0.01,
		default: 1,
		description: 'Playback Rate',
	},
	loop: {type: 'boolean', default: false, description: 'Loop'},
} as const satisfies SequenceSchema;

const AudioInner: React.FC<
	AudioProps & {
		readonly controls: SequenceControls | undefined;
	}
> = (props) => {
	// Should only destruct `trimBefore` and `trimAfter` from props,
	// rest gets drilled down
	const {name, stack, showInTimeline, controls, ...otherProps} = props;
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

	return (
		<AudioForPreview
			name={name}
			{...otherProps}
			stack={stack ?? null}
			controls={controls}
		/>
	);
};

export const Audio = Internals.wrapInSchema(AudioInner, audioSchema);

Internals.addSequenceStackTraces(Audio);
