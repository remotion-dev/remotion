import {radialProgressiveBlur} from '@remotion/effects/radial-progressive-blur';
import {loadFont} from '@remotion/google-fonts/Inter';
import {
	AbsoluteFill,
	CanvasImage,
	Easing,
	HtmlInCanvas,
	Interactive,
	Sequence,
	Solid,
	interpolate,
	useCurrentFrame,
} from 'remotion';
import {WebMCPPromo2Preview} from '../WebMCPPromo2';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['400', '500', '600'],
});

export const MacBookAppScene = () => {
	return (
		<AbsoluteFill
			name="Codex and Studio app"
			style={{
				borderRadius: 19,
				overflow: 'hidden',
			}}
		>
			<CanvasImage
				fit="cover"
				height={827}
				name="Codex and Studio screenshot"
				src="https://remotion.media/webmcp-promo/codex-and-studio.png"
				width={1320}
			/>
			<Interactive.Div
				name="Browser recording"
				style={{
					height: 2586,
					left: 634.6825,
					position: 'absolute',
					scale: '0.290635 0.289438',
					top: 78.5127,
					transformOrigin: '0 0',
					width: 2358,
				}}
			>
				<WebMCPPromo2Preview />
			</Interactive.Div>
		</AbsoluteFill>
	);
};

export const MacBookDesktopScene = () => {
	return (
		<Interactive.Div
			name="Desktop / screen"
			style={{
				backgroundColor: '#101114',
				border: '1px solid #35373d',
				borderRadius: 36,
				boxShadow: '0 42px 90px rgba(15, 22, 35, 0.24)',
				height: 863,
				left: 282,
				overflow: 'hidden',
				position: 'absolute',
				top: 70,
				width: 1356,
				zIndex: 1,
			}}
		>
			<CanvasImage
				fit="cover"
				height={827}
				name="Tahoe wallpaper"
				src="https://remotion.media/webmcp-promo/tahoe-light-wallpaper.jpg"
				style={{
					borderRadius: 19,
					left: 18,
					position: 'absolute',
					top: 18,
				}}
				width={1320}
			/>
			<Sequence
				from={165}
				trimBefore={76}
				height={827}
				name="App"
				style={{
					boxShadow: '0 32px 90px rgba(15, 22, 35, 0.38)',
					borderRadius: 19,
					left: 137,
					overflow: 'hidden',
					scale: 0.977,
					top: 76,
					transformOrigin: '0 0',
					zIndex: 1,
					translate: '-104.8px -11px',
				}}
				width={1320}
				premountFor={30}
			>
				<MacBookAppScene />
			</Sequence>
			<Sequence
				from={13}
				durationInFrames={184}
				height={827}
				freeze={108}
				name="App"
				style={{
					boxShadow: '0 32px 90px rgba(15, 22, 35, 0.38)',
					borderRadius: 19,
					left: 137,
					overflow: 'hidden',
					scale: 0.977,
					top: 76,
					transformOrigin: '0 0',
					zIndex: 1,
					translate: '-104.8px -11px',
				}}
				width={1320}
				premountFor={30}
			>
				<MacBookAppScene />
			</Sequence>

			<Interactive.Div
				name="Camera notch"
				style={{
					backgroundColor: '#101114',
					borderRadius: '0 0 18px 18px',
					height: 56,
					left: 603,
					position: 'absolute',
					top: 0,
					width: 150,
					zIndex: 2,
				}}
			/>
		</Interactive.Div>
	);
};

export const MacBookScene = () => {
	const frame = useCurrentFrame();
	return (
		<>
			<Solid
				width={1920}
				height={1080}
				color={'#ffffff'}
				style={{
					position: 'absolute',
				}}
				from={-43}
			/>
			<HtmlInCanvas
				width={1920}
				height={1080}
				effects={[
					radialProgressiveBlur({
						center: [0.649, 0.332],
						height: 1.314,
						width: 0.61,
						start: 0.37,
						endBlur: interpolate(frame, [88, 161, 591, 620], [0, 16, 16, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						rotation: 66.4,
					}),
				]}
			>
				<AbsoluteFill
					name="MacBook Air scene"
					style={{
						overflow: 'hidden',
						translate: interpolate(
							frame,
							[21, 170, 591, 620],
							[
								'0px 140.400678px',
								'-862.3px -292.5px',
								'-862.3px -292.5px',
								'0px 140.400678px',
							],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: [
									Easing.spring({
										damping: 200,
										mass: 1,
										stiffness: 100,
										allowTail: true,
										durationRestThreshold: 0.02,
										overshootClamping: false,
									}),
									Easing.spring({
										damping: 200,
										mass: 1,
										stiffness: 100,
										allowTail: true,
										durationRestThreshold: 0.02,
										overshootClamping: false,
									}),
									Easing.spring({
										damping: 200,
										mass: 1,
										stiffness: 100,
										allowTail: true,
										durationRestThreshold: 0.02,
										overshootClamping: false,
									}),
								],
							},
						),
						scale: interpolate(
							frame,
							[21, 170, 591, 620],
							[1.26, 6.02, 6.02, 1.26],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								output: 'perceptual-scale',
								easing: [
									Easing.spring({
										damping: 200,
										mass: 1,
										stiffness: 100,
										allowTail: true,
										durationRestThreshold: 0.02,
										overshootClamping: false,
									}),
									Easing.spring({
										damping: 200,
										mass: 1,
										stiffness: 100,
										allowTail: true,
										durationRestThreshold: 0.02,
										overshootClamping: false,
									}),
									Easing.spring({
										damping: 200,
										mass: 1,
										stiffness: 100,
										allowTail: true,
										durationRestThreshold: 0.02,
										overshootClamping: false,
									}),
								],
							},
						),
						rotate: interpolate(
							frame,
							[21, 170, 591, 620],
							[
								'0deg',
								'0.945221 -0.227695 0.233905 45.778028deg',
								'0.945221 -0.227695 0.233905 45.778028deg',
								'0deg',
							],
							{
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
								easing: [
									Easing.spring({
										damping: 200,
										mass: 1,
										stiffness: 100,
										allowTail: true,
										durationRestThreshold: 0.02,
										overshootClamping: false,
									}),
									Easing.spring({
										damping: 200,
										mass: 1,
										stiffness: 100,
										allowTail: true,
										durationRestThreshold: 0.02,
										overshootClamping: false,
									}),
									Easing.spring({
										damping: 200,
										mass: 1,
										stiffness: 100,
										allowTail: true,
										durationRestThreshold: 0.02,
										overshootClamping: false,
									}),
								],
							},
						),
					}}
					from={-43}
				>
					<Sequence layout="none" name="Desktop / screen">
						<MacBookDesktopScene />
					</Sequence>
				</AbsoluteFill>
			</HtmlInCanvas>
			<Interactive.Div
				name="Chat sidebar"
				style={{
					backgroundColor: '#ffffff',
					bottom: 0,
					boxSizing: 'border-box',
					display: 'flex',
					flexDirection: 'column',
					fontFamily: 'Inter',
					isolation: 'isolate',
					justifyContent: 'center',
					left: 0,
					padding: '104px 64px',
					position: 'absolute',
					top: 0,
					translate: interpolate(
						frame,
						[240, 285, 591, 609],
						['-768px 0px', '0px 0px', '0px 0px', '-768px 0px'],
						{
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.linear,
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
						},
					),
					width: 768,
					zIndex: 20,
				}}
			>
				<Interactive.Div
					name="User message"
					style={{
						alignSelf: 'flex-end',
						backgroundColor: '#F3F3F4',
						borderRadius: 36,
						color: '#202123',
						fontSize: 54,
						fontWeight: 500,
						letterSpacing: -1.8,
						lineHeight: 1.2,
						marginLeft: 'auto',
						padding: '28px 38px',
						position: 'relative',
						translate: interpolate(frame, [281, 306], ['0px 28px', '0px 0px'], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
						}),
						width: 'fit-content',
						zIndex: 2,
						opacity: interpolate(frame, [281, 306], [0, 1], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
							],
						}),
					}}
				>
					Make this bigger.
				</Interactive.Div>
				<Interactive.Div
					name="Tool call"
					style={{
						alignItems: 'center',
						color: '#8b8c90',
						display: 'flex',
						fontSize: 52,
						fontWeight: 500,
						gap: 20,
						letterSpacing: -1.6,
						marginTop: 48,
						opacity: interpolate(frame, [324, 340, 415, 439], [0, 1, 1, 0], {
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							easing: [
								Easing.spring({
									damping: 200,
									mass: 1,
									stiffness: 100,
									allowTail: true,
									durationRestThreshold: 0.02,
									overshootClamping: false,
								}),
								Easing.linear,
								Easing.bezier(0.42, 0, 1, 1),
							],
						}),
						position: 'relative',
						zIndex: 2,
					}}
				>
					<svg
						aria-hidden="true"
						fill="currentColor"
						height={60}
						viewBox="0 0 576 512"
						width={60}
					>
						<path d="M208 168c0-92.8 75.2-168 168-168 27.1 0 52.8 6.4 75.5 17.9 6.9 3.5 11.7 10 12.9 17.6s-1.3 15.3-6.7 20.8l-73.7 73.7 0 30.1 30.1 0 73.7-73.7c5.4-5.4 13.2-7.9 20.8-6.7s14.2 6 17.6 12.9c11.4 22.7 17.9 48.4 17.9 75.5 0 92.8-75.2 168-168 168-16.6 0-32.7-2.4-47.9-6.9L152.6 504.6c-31.2 31.2-81.9 31.2-113.1 0s-31.2-81.9 0-113.1L214.9 215.9c-4.5-15.2-6.9-31.3-6.9-47.9zM376 48c-66.3 0-120 53.7-120 120 0 16 3.1 31.3 8.8 45.2 3.6 8.9 1.6 19.2-5.3 26l-186.2 186.2 0 0c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L304.8 284.5c6.8-6.8 17.1-8.9 26-5.3 13.9 5.7 29.2 8.8 45.2 8.8 66.3 0 120-53.7 120-120 0-6.9-.6-13.7-1.7-20.3L441 201c-4.5 4.5-10.6 7-17 7l-64 0c-13.3 0-24-10.7-24-24l0-64c0-6.4 2.5-12.5 7-17l53.3-53.3C389.7 48.6 382.9 48 376 48z" />
					</svg>
					<span
						style={{
							display: 'inline-block',
							position: 'relative',
						}}
					>
						<span style={{color: '#8b8c90'}}>get_selection</span>
						<span
							aria-hidden="true"
							style={{
								backgroundClip: 'text',
								backgroundImage:
									'linear-gradient(110deg, transparent 25%, #d5d6d8 50%, transparent 75%)',
								backgroundPosition: `${interpolate(
									frame,
									[340, 415],
									[200, -100],
									{
										extrapolateLeft: 'clamp',
										extrapolateRight: 'clamp',
										easing: Easing.linear,
									},
								)}% 50%`,
								backgroundRepeat: 'no-repeat',
								backgroundSize: '200% 100%',
								color: 'transparent',
								inset: 0,
								opacity: frame >= 340 && frame < 415 ? 1 : 0,
								position: 'absolute',
								WebkitBackgroundClip: 'text',
							}}
						>
							get_selection
						</span>
					</span>
				</Interactive.Div>
				<Interactive.Div
					name="Done message"
					style={{
						color: '#202123',
						fontSize: 52,
						fontWeight: 500,
						letterSpacing: -1.6,
						lineHeight: 1.2,
						marginTop: -62,
						position: 'relative',
						zIndex: 2,
					}}
				>
					<span
						style={{
							opacity: interpolate(frame, [450, 451], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					>
						Do
					</span>
					<span
						style={{
							opacity: interpolate(frame, [451, 453], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					>
						ne
					</span>
					<span
						style={{
							opacity: interpolate(frame, [453, 455], [0, 1], {
								extrapolateLeft: 'clamp',
								extrapolateRight: 'clamp',
							}),
						}}
					>
						.
					</span>
				</Interactive.Div>
			</Interactive.Div>
		</>
	);
};

export const MacBookLoopScene = () => {
	const frame = useCurrentFrame();
	const incomingOpacity = interpolate(frame, [775, 799], [0, 1], {
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<>
			<AbsoluteFill>
				<MacBookScene />
			</AbsoluteFill>
			<Sequence
				durationInFrames={25}
				freeze={0}
				from={775}
				layout="none"
				name="Beginning crossfade"
			>
				<AbsoluteFill style={{opacity: incomingOpacity}}>
					<MacBookScene />
				</AbsoluteFill>
			</Sequence>
		</>
	);
};
