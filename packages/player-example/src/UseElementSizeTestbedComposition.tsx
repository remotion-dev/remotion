import {AbsoluteFill} from 'remotion';

/**
 * 16:9 composition with strong top/bottom bands. When `useElementSize` reports a
 * wrong height under transformed ancestors (#7183), the Player letterboxes and
 * these bands no longer align with the plate edges.
 */
export const UseElementSizeTestbedComposition = () => {
	return (
		<AbsoluteFill style={{backgroundColor: '#16213e'}}>
			<div
				style={{
					position: 'absolute',
					top: 0,
					left: 0,
					right: 0,
					height: 48,
					backgroundColor: '#e94560',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: '#fff',
					fontSize: 28,
					fontFamily: 'system-ui, sans-serif',
				}}
			>
				TOP
			</div>
			<div
				style={{
					position: 'absolute',
					bottom: 0,
					left: 0,
					right: 0,
					height: 48,
					backgroundColor: '#0f3460',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					color: '#fff',
					fontSize: 28,
					fontFamily: 'system-ui, sans-serif',
				}}
			>
				BOTTOM
			</div>
		</AbsoluteFill>
	);
};
