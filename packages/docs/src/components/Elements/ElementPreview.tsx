import {Player} from '@remotion/player';
import React, {type ComponentType} from 'react';

type ElementPreviewProps = {
	readonly component: ComponentType<Record<string, never>>;
	readonly durationInFrames: number;
	readonly fps: number;
	readonly width: number;
	readonly height: number;
};

const maxPreviewHeight = 560;

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
			<div
				style={{
					aspectRatio: `${width} / ${height}`,
					maxHeight: maxPreviewHeight,
					width: '100%',
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
						height: '100%',
						width: '100%',
					}}
				/>
			</div>
		</div>
	);
};
