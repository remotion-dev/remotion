import {fontFamily, loadFont} from '@remotion/google-fonts/Inter';
import {Easing, Interactive, interpolate, useCurrentFrame} from 'remotion';

loadFont('normal', {
	subsets: ['latin'],
	weights: ['400'],
});

export const OnScreenMessages = () => {
	const frame = useCurrentFrame();

	return (
		<>
			<style>{`
				.on-screen-message-from-them::after,
				.on-screen-message-from-me::after {
					bottom: 0;
					content: '';
					height: 32px;
					position: absolute;
					width: 32px;
				}

				.on-screen-message-from-them::after {
					background-color: #e5e5ea;
					clip-path: path('M32 0H12v16c0 8-4 13-12 16 18 0 32-7 32-16Z');
					left: -12px;
				}

				.on-screen-message-from-me::after {
					background-color: #248bf5;
					clip-path: path('M0 0h20v16c0 8 4 13 12 16C14 32 0 25 0 16Z');
					right: -12px;
				}
			`}</style>
			<Interactive.Div
				name="Container"
				style={{
					boxSizing: 'border-box',
					color: '#f8fafc',
					display: 'flex',
					flexDirection: 'column',
					fontFamily,
					gap: 32,
					height: 680,
					isolation: 'isolate',
					paddingTop: 90,
					position: 'relative',
					width: 1260,
				}}
			>
				<Interactive.Div
					className="on-screen-message-from-them"
					name="Message 1"
					style={{
						alignSelf: 'flex-start',
						backgroundColor: '#e5e5ea',
						borderRadius: 37,
						boxSizing: 'border-box',
						color: '#000000',
						fontSize: 40,
						fontWeight: 400,
						lineHeight: 1.25,
						marginLeft: 70,
						maxWidth: '75%',
						opacity: interpolate(frame, [2, 10], [0, 1], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						padding: '16px 28px',
						position: 'relative',
						translate: interpolate(frame, [2, 10], ['0px 32px', '0px 0px'], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						width: 'fit-content',
						willChange: 'opacity, transform',
						wordWrap: 'break-word',
					}}
				>
					I just saw you at the station.
				</Interactive.Div>
				<Interactive.Div
					className="on-screen-message-from-me"
					name="Message 2"
					style={{
						alignSelf: 'flex-end',
						backgroundColor: '#248bf5',
						borderRadius: 37,
						boxSizing: 'border-box',
						color: '#ffffff',
						fontSize: 40,
						fontWeight: 400,
						lineHeight: 1.25,
						marginRight: 70,
						maxWidth: '75%',
						opacity: interpolate(frame, [27, 35], [0, 1], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						padding: '16px 28px',
						position: 'relative',
						translate: interpolate(frame, [27, 35], ['0px 32px', '0px 0px'], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						width: 'fit-content',
						willChange: 'opacity, transform',
						wordWrap: 'break-word',
					}}
				>
					I’m still in Berlin.
				</Interactive.Div>
				<Interactive.Div
					className="on-screen-message-from-them"
					name="Message 3"
					style={{
						alignSelf: 'flex-start',
						backgroundColor: '#e5e5ea',
						borderRadius: 37,
						boxSizing: 'border-box',
						color: '#000000',
						fontSize: 40,
						fontWeight: 400,
						lineHeight: 1.25,
						marginLeft: 70,
						maxWidth: '75%',
						opacity: interpolate(frame, [52, 59], [0, 1], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						padding: '16px 28px',
						position: 'relative',
						translate: interpolate(frame, [52, 59], ['0px 32px', '0px 0px'], {
							easing: Easing.bezier(0.16, 1, 0.3, 1),
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						}),
						width: 'fit-content',
						willChange: 'opacity, transform',
						wordWrap: 'break-word',
					}}
				>
					Then who waved back?
				</Interactive.Div>
			</Interactive.Div>
		</>
	);
};
