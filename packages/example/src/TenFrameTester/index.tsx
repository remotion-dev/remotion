import {HtmlInCanvasMotionBlur} from '@remotion/motion-blur';
import {AbsoluteFill, Html5Audio, useCurrentFrame} from 'remotion';
import ReactSvg from '../ReactSvg';

const MovingSquare: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'black'}}>
			<div
				style={{
					position: 'absolute',
					top: 20,
					left: 32 + frame * 32,
					width: 20,
					height: 20,
					backgroundColor: 'red',
				}}
			/>
		</AbsoluteFill>
	);
};

// Short video that is fast to render for testing
export const TenFrameTester: React.FC = () => (
	<AbsoluteFill>
		<ReactSvg transparent={false} />
		<div style={{position: 'absolute', left: 0, top: 0}}>
			<HtmlInCanvasMotionBlur
				width={400}
				height={80}
				samples={8}
				shutterAngle={360}
			>
				<MovingSquare />
			</HtmlInCanvasMotionBlur>
		</div>
		<Html5Audio src="https://remotion.media/music.mp3" />
	</AbsoluteFill>
);
