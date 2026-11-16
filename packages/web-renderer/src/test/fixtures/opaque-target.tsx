import {AbsoluteFill, useCurrentFrame} from 'remotion';

const OpaqueText = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill style={{backgroundColor: 'white'}}>
			<svg width={400} height={120}>
				<text
					x={12}
					y={48}
					style={{fontFamily: 'sans-serif', fontSize: 32 + frame * 2}}
				>
					Native opaque text
				</text>
			</svg>
		</AbsoluteFill>
	);
};

export const opaqueTargetText = {
	component: OpaqueText,
	id: 'opaque-target-text',
	width: 400,
	height: 120,
	fps: 30,
	durationInFrames: 2,
};

const TransparentGroup = () => (
	<div style={{width: 16, height: 16, opacity: 0.5, mixBlendMode: 'screen'}}>
		<div style={{width: 16, height: 16, backgroundColor: 'red'}} />
		<div
			style={{
				position: 'absolute',
				top: 0,
				width: 8,
				height: 16,
				backgroundColor: 'blue',
			}}
		/>
	</div>
);
export const opaqueTargetGroup = {
	component: TransparentGroup,
	id: 'opaque-target-group',
	width: 16,
	height: 16,
	fps: 30,
	durationInFrames: 2,
};
