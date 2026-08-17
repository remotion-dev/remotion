import {Audio as MediaAudio} from '@remotion/media';
import {ding} from '@remotion/sfx';
import {Html5Audio, Sequence} from 'remotion';

export type Issue10468Props = {
	readonly implementation: 'html5' | 'media';
	readonly src: string;
};

export const issue10468DefaultProps: Issue10468Props = {
	implementation: 'media',
	src: ding,
};

export const issue5758DefaultProps = {src: ding};

export const Issue10468: React.FC<Issue10468Props> = ({
	implementation,
	src,
}) => {
	const Component = implementation === 'html5' ? Html5Audio : MediaAudio;

	return (
		<Sequence from={81} durationInFrames={39}>
			<Component src={src} trimBefore={4} volume={0.3} />
		</Sequence>
	);
};

export const Issue5758: React.FC<{src: string}> = ({src}) => {
	return <MediaAudio src={src} />;
};
