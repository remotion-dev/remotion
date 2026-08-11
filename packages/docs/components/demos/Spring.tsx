import React from 'react';
import {AbsoluteFill, spring, useCurrentFrame, useVideoConfig} from 'remotion';

export const SpringDemo: React.FC<{
	readonly damping?: number;
	readonly mass?: number;
	readonly stiffness?: number;
	readonly overshootClamping?: boolean;
	readonly reverse?: boolean;
	readonly durationInFrames?: number;
}> = ({
	damping = 10,
	mass = 1,
	stiffness = 100,
	overshootClamping = false,
	reverse = false,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();

	const value = spring({
		frame,
		fps,
		config: {
			damping,
			mass,
			stiffness,
			overshootClamping,
		},
		durationInFrames: durationInFrames ?? undefined,
		reverse,
	});

	return (
		<AbsoluteFill
			style={{
				padding: 20,
				fontSize: 20,
				fontFamily: 'GTPlanar',
			}}
		>
			<div>
				&quot;spring&quot;: {value.toFixed(3)}, &quot;frame&quot;: &quot;
				{frame}&quot;
			</div>
			<AbsoluteFill
				style={{
					justifyContent: 'center',
					alignItems: 'center',
				}}
			>
				<div
					style={{
						height: 100,
						width: 100,
						backgroundColor: 'var(--ifm-color-primary)',
						borderRadius: 10,
						scale: value,
					}}
				/>
			</AbsoluteFill>
		</AbsoluteFill>
	);
};
