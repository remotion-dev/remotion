import {Img} from 'remotion';

export const BackgroundRemovalDemo = () => {
	return (
		<div style={{position: 'absolute', inset: 0}}>
			<Img
				name="Background"
				src="https://remotion.media/explore-remotion/whats-new-jonny-background-2026-10-27-eb0e748dc4b9.png"
				durationInFrames={120}
				style={{
					position: 'absolute',
					left: 180,
					top: 600,
					width: 1240,
					height: 697.5,
					rotate: '0.15 -1 -0.12 22deg',
					border: '2px solid #aeb7c5',
					boxShadow: '0 20px 60px #17243b18',
					translate: '0px -148.8px',
				}}
			/>
			<Img
				name="Foreground"
				src="https://remotion.media/explore-remotion/whats-new-jonny-foreground-2026-10-27-d7cfb160e8d8.png"
				durationInFrames={120}
				style={{
					position: 'absolute',
					left: 180,
					top: 600,
					width: 1240,
					height: 697.5,
					rotate: '0.15 -1 -0.12 22deg',
					translate: '0px -148.8px',
					border: '2px solid #aeb7c5',
				}}
			/>
		</div>
	);
};
