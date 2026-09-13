import {Video} from '@remotion/media';
import {AbsoluteFill, Sequence, useVideoConfig} from 'remotion';
import {assetUrl} from './assets';
import {SILENCES} from './Composition';
import {LowerThird} from './LowerThird';

const FILE = 'whats1.mov';

export const Scene1: React.FC = () => {
	const {fps} = useVideoConfig();
	const silence = SILENCES[FILE];
	const trimBefore = Math.floor(silence.leadingEnd * fps);
	const trimAfter = Math.ceil(silence.trailingStart * fps);

	return (
		<AbsoluteFill>
			<Video
				src={assetUrl(FILE)}
				trimBefore={trimBefore}
				trimAfter={trimAfter}
			/>
			<Sequence from={15} layout="none">
				<LowerThird
					name="Jonny Burger"
					title="Chief Hacker, Remotion"
					durationInFrames={Math.ceil(trimAfter - trimBefore - 15)}
				/>
			</Sequence>
		</AbsoluteFill>
	);
};
