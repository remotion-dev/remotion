import {Easing, interpolate, Solid, useCurrentFrame} from 'remotion';

export const KeyframeDeleteFlash = () => {
	const frame = useCurrentFrame();

	return (
		<div
			style={{
				position: 'absolute',
				inset: 0,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				backgroundColor: '#111827',
				color: 'white',
				fontFamily: 'sans-serif',
			}}
		>
			<div style={{position: 'absolute', top: 40, left: 48}}>
				<div style={{fontSize: 32, fontWeight: 600}}>
					Keyframe deletion test
				</div>
				<div style={{fontSize: 20, marginTop: 12, color: '#cbd5e1'}}>
					Open Scale, marquee-select two keyframes, then press Backspace.
				</div>
			</div>
			<Solid
				name="Scale keyframes"
				width={220}
				height={220}
				color="#3b82f6"
				style={{
					borderRadius: 24,
					scale: interpolate(
						frame,
						[0, 108, 394, 399],
						[
							1.5316030229881714, 1.5316030229881714, 1.3784427206893544,
							1.5316030229881714,
						],
						{
							easing: [Easing.step1, Easing.linear, Easing.step1],
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
							outputType: 'scale',
						},
					),
				}}
			/>
		</div>
	);
};
