import {Player} from '@remotion/player';
import React, {type ComponentType} from 'react';

type ElementPreviewProps = {
	readonly component: ComponentType<Record<string, never>>;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly width: number;
	readonly height: number;
};

export const ElementPreview: React.FC<ElementPreviewProps> = ({
	component,
	durationInFrames,
	fps,
	width,
	height,
}) => {
	return (
		<div
			style={{
				backgroundColor: '#f5f6f7',
				overflow: 'hidden',
			}}
		>
			<Player
				acknowledgeRemotionLicense
				autoPlay
				component={component}
				durationInFrames={durationInFrames}
				fps={fps}
				compositionWidth={width}
				compositionHeight={height}
				controls
				initiallyMuted
				loop
				style={{
					width: '100%',
				}}
			/>
		</div>
	);
};
