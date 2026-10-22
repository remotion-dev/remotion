import {colorCorrection} from '@remotion/effects/color-correction';
import {grayscale} from '@remotion/effects/grayscale';
import {HtmlInCanvas, Sequence} from 'remotion';
import {Composition3DRotationPreview} from '../../Composition3DRotation';

export const ExploreRemotion3DRotation = () => {
	return (
		<HtmlInCanvas
			width={1080}
			height={1080}
			effects={[
				grayscale({}),
				colorCorrection({
					pivot: 0,
					shadows: 1,
					whites: 0.26,
					blacks: -1,
					temperature: -1,
				}),
			]}
		>
			<div
				style={{
					position: 'absolute',
					left: -420,
					top: 0,
					width: 1920,
					height: 1080,
				}}
			>
				<Sequence name="3DRotation" durationInFrames={1115}>
					<Composition3DRotationPreview />
				</Sequence>
			</div>
		</HtmlInCanvas>
	);
};
