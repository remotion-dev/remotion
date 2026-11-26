import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {AbsoluteFill, Sequence} from 'remotion';
import {SpinningRemotionTriangle} from './RemotionTriangleMotionBlur';

export const MotionBlurTriangleDemo = () => (
	<>
		<AbsoluteFill
			name="Triangle backdrop"
			style={{backgroundColor: '#F8FAFC'}}
		/>
		<HtmlInCanvasMotionBlur
			width={1080}
			height={960}
			from={0}
			durationInFrames={96}
			trimBefore={0}
			shutterAngle={214}
			samples={40}
		>
			<Sequence name="Remotion triangle">
				<SpinningRemotionTriangle />
			</Sequence>
		</HtmlInCanvasMotionBlur>
	</>
);
