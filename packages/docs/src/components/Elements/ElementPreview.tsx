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
				border: '1px solid var(--ifm-color-emphasis-300)',
				borderRadius: 12,
				overflow: 'hidden',
				backgroundColor: 'var(--ifm-color-emphasis-100)',
				marginBottom: 24,
			}}
		>
			<Player
				acknowledgeRemotionLicense
				component={component}
				durationInFrames={durationInFrames}
				fps={fps}
				compositionWidth={width}
				compositionHeight={height}
				controls
				style={{
					width: '100%',
				}}
			/>
		</div>
	);
};
