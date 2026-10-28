import {Img, Interactive} from 'remotion';

export const BackgroundRemovalDemo = () => {
	return (
		<div style={{position: 'absolute', inset: 0, backgroundColor: '#176693'}}>
			<Img
				name="Sky"
				src={
					'https://remotion.media/explore-remotion/building-background-2026-10-28-69fc218591c6.jpg'
				}
				durationInFrames={120}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
				}}
			/>
			<Interactive.Div
				name="Remotion"
				durationInFrames={120}
				style={{
					position: 'absolute',
					left: 65,
					top: 5,
					width: 1490,
					height: 340,
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: 314,
					fontWeight: 900,
					letterSpacing: -13,
					lineHeight: 1,
					color: 'white',
					textAlign: 'center',
					translate: '0px 111.9px',
				}}
			>
				Remotion
			</Interactive.Div>
			<Img
				name="Building"
				src={
					'https://remotion.media/explore-remotion/building-building-2026-10-28-273eb6c977ae.png'
				}
				durationInFrames={120}
				style={{
					position: 'absolute',
					inset: 0,
					width: '100%',
					height: '100%',
				}}
			/>
		</div>
	);
};
