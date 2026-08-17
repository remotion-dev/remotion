import {Audio as MediaAudio} from '@remotion/media';
import {ding} from '@remotion/sfx';
import {Html5Audio, Sequence} from 'remotion';

export type Issue10468Props = {
	readonly implementation: 'html5' | 'media';
	readonly src: string;
	readonly variant: 'reproduction' | 'untrimmed' | 'playback-rate';
};

export const issue10468DefaultProps: Issue10468Props = {
	implementation: 'media',
	src: ding,
	variant: 'reproduction',
};

export const Issue10468: React.FC<Issue10468Props> = ({
	implementation,
	src,
	variant,
}) => {
	const Component = implementation === 'html5' ? Html5Audio : MediaAudio;

	return (
		<Sequence from={81} durationInFrames={39}>
			<Component
				src={src}
				trimBefore={variant === 'untrimmed' ? undefined : 4}
				playbackRate={variant === 'playback-rate' ? 1.1 : 1}
				volume={0.3}
			/>
		</Sequence>
	);
};
