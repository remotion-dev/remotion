import {Interactive, Sequence, useVideoConfig} from 'remotion';
import {MotionBlurEditorCaptureComposition} from './MotionBlurEditorCapture';

const MotionBlurAdjustmentContent = () => {
	const {width, height} = useVideoConfig();

	return (
		<Sequence
			name="Increase shutter angle"
			trimBefore={237}
			durationInFrames={105}
			width={width}
			height={height}
		>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: '100%',
					height: '50%',
					overflow: 'hidden',
					backgroundColor: '#1f2327',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						width: 1080,
						height: 480,
						translate: '-50% -50%',
						scale: Math.min(width / 1080, height / 960),
						transformOrigin: '50% 50%',
						overflow: 'hidden',
						perspective: 1400,
						perspectiveOrigin: '50% 50%',
					}}
				>
					<MotionBlurEditorCaptureComposition
						name="Motion blur controls"
						width={3742}
						height={1966}
						cropLeft={0.72}
						cropRight={0.02}
						cropTop={0.185}
						cropBottom={0.712}
						style={{
							translate: '-2518px -232px',
							scale: 1.6,
							rotate: '0.904608 0.351506 -0.241096 27.995464deg',
							transformOrigin: '84% 24%',
						}}
					/>
				</div>
			</div>
			<div
				style={{
					position: 'absolute',
					left: 0,
					top: '50%',
					width: '100%',
					height: '50%',
					overflow: 'hidden',
					backgroundColor: '#0e1317',
				}}
			>
				<div
					style={{
						position: 'absolute',
						left: '50%',
						top: '50%',
						width: 1080,
						height: 480,
						translate: '-50% -50%',
						scale: Math.min(width / 1080, height / 960),
						transformOrigin: '50% 50%',
						overflow: 'hidden',
					}}
				>
					<MotionBlurEditorCaptureComposition
						name="Canvas responding to motion blur"
						width={3742}
						height={1966}
						cropLeft={0.08}
						cropRight={0.4}
						cropTop={0.24}
						cropBottom={0.21}
						style={{
							translate: '-60px -237px',
							scale: 0.47,
							transformOrigin: '0% 0%',
						}}
					/>
				</div>
			</div>
		</Sequence>
	);
};

export const MotionBlurAdjustment = Interactive.create({
	Component: MotionBlurAdjustmentContent,
	layout: 'absolute-fill',
	schema: {},
});
