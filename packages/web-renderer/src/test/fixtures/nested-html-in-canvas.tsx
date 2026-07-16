import {fisheye} from '@remotion/effects/fisheye';
import {halftone} from '@remotion/effects/halftone';
import {wave} from '@remotion/effects/wave';
import {AbsoluteFill, HtmlInCanvas} from 'remotion';

const Component: React.FC = () => {
	return (
		<HtmlInCanvas
			width={320}
			height={180}
			effects={[
				fisheye({
					fieldOfView: 2.3,
					radius: 0.95,
					zoom: 1,
				}),
			]}
		>
			<AbsoluteFill
				style={{
					alignItems: 'center',
					backgroundColor: '#071426',
					backgroundImage:
						'linear-gradient(rgba(90, 185, 255, 0.4) 1px, transparent 1px), linear-gradient(90deg, rgba(90, 185, 255, 0.4) 1px, transparent 1px)',
					backgroundSize: '16px 16px',
					justifyContent: 'center',
				}}
			>
				<HtmlInCanvas
					width={200}
					height={120}
					effects={[
						wave({
							amplitude: 10,
							phase: 0,
							wavelength: 60,
						}),
					]}
				>
					<AbsoluteFill
						style={{
							alignItems: 'center',
							backgroundColor: '#ffcc00',
							justifyContent: 'center',
						}}
					>
						<HtmlInCanvas
							width={100}
							height={60}
							effects={[
								halftone({
									colorMode: 'source',
									dotSize: 5,
									dotSpacing: 6,
									rotation: -8,
								}),
							]}
						>
							<AbsoluteFill style={{backgroundColor: '#ff1744'}} />
						</HtmlInCanvas>
					</AbsoluteFill>
				</HtmlInCanvas>
			</AbsoluteFill>
		</HtmlInCanvas>
	);
};

export const nestedHtmlInCanvas = {
	component: Component,
	id: 'nested-html-in-canvas',
	width: 320,
	height: 180,
	fps: 30,
	durationInFrames: 1,
} as const;
