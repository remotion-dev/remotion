import {MacOSCursor} from '@remotion/mac-cursors';
import {
	AbsoluteFill,
	Easing,
	Img,
	interpolate,
	Sequence,
	useCurrentFrame,
} from 'remotion';

export const canvasCaptureDuration = 170;

export const ExploreRemotionCanvasCapture = () => {
	const frame = useCurrentFrame();
	const zoom = 1.36;
	const approach = interpolate(frame, [12, 46], [0, 1], {
		easing: Easing.inOut(Easing.cubic),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const leave = interpolate(frame, [74, 103], [0, 1], {
		easing: Easing.inOut(Easing.cubic),
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const cursorX = 1385 + approach * 400 + leave * 230;
	const cursorY = 2117 - approach * 500 + leave * 160;
	// Hit-test the rounded button captured at 3× resolution, using the cursor hotspot.
	const isOverRecordButton =
		Math.hypot((cursorX - 1785) / 60, (cursorY - 1617) / 57) <= 1;

	return (
		<AbsoluteFill
			name="Start Canvas Capture"
			durationInFrames={canvasCaptureDuration}
		>
			<div style={{position: 'absolute', inset: 0, backgroundColor: '#18191a'}}>
				<div
					style={{
						position: 'absolute',
						inset: 0,
						overflow: 'visible',
						rotate: '0.904608 0.351506 -0.241096 27.995464deg',
					}}
				>
					<div
						style={{
							position: 'absolute',
							left: 540 - 1785 * zoom,
							top: 540 - 1617 * zoom,
							width: 3300,
							height: 2700,
							scale: zoom,
							transformOrigin: 'top left',
						}}
					>
						<Sequence
							durationInFrames={55}
							layout="none"
							name="Ready to record"
						>
							<Img
								src="https://remotion.media/explore-remotion/canvas-capture-ready-2026-10-27-e98376907e87.png"
								style={{position: 'absolute', width: 3300, height: 2700}}
							/>
						</Sequence>
						<Sequence
							from={55}
							durationInFrames={60}
							layout="none"
							name="Record clicked"
						>
							<Img
								src="https://remotion.media/explore-remotion/canvas-capture-recording-start-2026-10-27-302e5b5c7efc.png"
								style={{position: 'absolute', width: 3300, height: 2700}}
							/>
						</Sequence>
						<Sequence
							from={115}
							durationInFrames={55}
							layout="none"
							name="Recording timer"
						>
							<Img
								src="https://remotion.media/explore-remotion/canvas-capture-recording-second-2026-10-27-bb0cccbdb9e5.png"
								style={{position: 'absolute', width: 3300, height: 2700}}
							/>
						</Sequence>
						<MacOSCursor
							cursor={isOverRecordButton ? 'pointer' : 'default'}
							style={{
								position: 'absolute',
								left: 0,
								top: 0,
								translate: `${cursorX}px ${cursorY}px`,
								scale: interpolate(
									frame,
									[0, 52, 55, 60, 169],
									[3, 3, 2.65, 3, 3],
								),
							}}
						/>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};
