import {Card, CheckIcon} from '@remotion/design';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';

const backends = ['Canvas 2D', 'WebGL', 'WebGPU'];

export const EffectsBackendsSlide = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	return (
		<AbsoluteFill
			style={{
				display: 'grid',
				placeItems: 'center',
				boxSizing: 'border-box',
				padding: '48px 9% 132px',
				backgroundColor: '#18191a',
				color: '#ffffff',
				colorScheme: 'dark',
				fontFamily: 'Effects GT Planar, sans-serif',
				fontWeight: 500,
			}}
		>
			<div style={{width: '100%', maxWidth: 780}}>
				<h2
					style={{
						margin: '0 0 46px',
						fontSize: 84,
						lineHeight: 1.02,
						letterSpacing: '-0.045em',
						fontWeight: 'inherit',
					}}
				>
					Supported Effect
					<br />
					Backends
				</h2>
				<ul
					style={{
						display: 'grid',
						gap: 23,
						margin: 0,
						padding: 0,
						listStyle: 'none',
					}}
				>
					{backends.map((backend, index) => (
						<li
							key={backend}
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 25,
								fontSize: 63,
								lineHeight: 1.1,
								letterSpacing: '-0.025em',
							}}
						>
							<Card
								aria-hidden
								style={{
									display: 'grid',
									placeItems: 'center',
									width: 78,
									height: 78,
									boxSizing: 'border-box',
									border: '3px solid #080c0a',
									borderBottomWidth: 10,
									borderRadius: 16,
									backgroundColor: '#2bc57c',
									color: '#091a13',
									scale: spring({
										frame: frame - index * 3,
										fps,
										from: 0.82,
										to: 1,
										config: {damping: 13, stiffness: 250},
									}),
								}}
							>
								<CheckIcon width={39} height={30} />
							</Card>
							{backend}
						</li>
					))}
				</ul>
			</div>
		</AbsoluteFill>
	);
};
