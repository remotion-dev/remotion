import {Video} from '@remotion/media';
import {AbsoluteFill, Sequence} from 'remotion';
import {assetUrl} from './assets';
import {LowerThird} from './LowerThird';

export const Scene1: React.FC = () => {
	return (
		<AbsoluteFill>
			<Video
				name="Presenter video"
				src={assetUrl('whats1.mov')}
				trimBefore={27}
				trimAfter={141}
			/>
			<Sequence name="Presenter introduction" from={15} layout="none">
				<LowerThird />
			</Sequence>
		</AbsoluteFill>
	);
};
