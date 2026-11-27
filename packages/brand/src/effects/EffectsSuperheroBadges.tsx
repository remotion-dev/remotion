import {
	Img,
	Interactive,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';

export const EffectsSuperheroBadges = () => {
	const frame = Math.floor(useCurrentFrame());

	return (
		<>
			<Img
				name="HTML5 logo over Deadpool"
				src={staticFile('effects-promo-2026-11-27/html5.svg')}
				alt="HTML5 logo by W3C"
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 112,
					height: 112,
					padding: 12,
					boxSizing: 'border-box',
					borderRadius: 18,
					backgroundColor: '#ffffff',
					boxShadow: '0 6px 20px #0004',
					translate: interpolate(
						frame,
						[0, 18, 36, 40, 41, 65, 89],
						[
							'856px -45px',
							'859px -66px',
							'850px -111px',
							'859px -117px',
							'826px 96px',
							'775px 96px',
							'745px 99px',
						],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			/>
			<Interactive.Div
				name="Canvas logo over Wolverine"
				style={{
					position: 'absolute',
					left: 0,
					top: 0,
					width: 112,
					height: 112,
					display: 'flex',
					flexDirection: 'column',
					alignItems: 'center',
					justifyContent: 'center',
					gap: 9,
					borderRadius: 18,
					backgroundColor: '#4338ca',
					boxShadow: '0 6px 20px #0004',
					color: '#ffffff',
					fontFamily: 'monospace',
					fontSize: 20,
					fontWeight: 700,
					translate: interpolate(
						frame,
						[0, 18, 36, 40, 41, 65, 89],
						[
							'208px 66px',
							'316px 57px',
							'241px 84px',
							'229px 93px',
							'211px 72px',
							'160px 60px',
							'67px 45px',
						],
						{extrapolateLeft: 'clamp', extrapolateRight: 'clamp'},
					),
				}}
			>
				<div
					style={{
						width: 57,
						height: 39,
						border: '2px solid #ffffff',
						borderRadius: 3,
						backgroundImage:
							'linear-gradient(to right, #fff9 1px, transparent 1px), linear-gradient(to bottom, #fff9 1px, transparent 1px)',
						backgroundSize: '19px 13px',
					}}
				/>
				{'<canvas>'}
			</Interactive.Div>
		</>
	);
};
