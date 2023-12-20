import React from 'react';
import {Internals} from 'remotion';
import {BACKGROUND, BORDER_COLOR} from '../helpers/colors';
import {isCompositionStill} from '../helpers/is-composition-still';
import {renderFrame} from '../state/render-frame';

export const CURRENT_COMPOSITION_HEIGHT = 80;

const container: React.CSSProperties = {
	height: CURRENT_COMPOSITION_HEIGHT,
	display: 'block',
	borderBottom: `1px solid ${BORDER_COLOR}`,
	padding: 12,
	color: 'white',
	backgroundColor: BACKGROUND,
};

const title: React.CSSProperties = {
	fontWeight: 'bold',
	fontSize: 12,
	whiteSpace: 'nowrap',
	lineHeight: '18px',
	backgroundColor: BACKGROUND,
};

const subtitle: React.CSSProperties = {
	fontSize: 12,
	opacity: 0.8,
	whiteSpace: 'nowrap',
	lineHeight: '18px',
	backgroundColor: BACKGROUND,
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
	lineHeight: '18px',
	backgroundColor: BACKGROUND,
};

export const CurrentComposition = () => {
	const video = Internals.useVideo();

	if (!video) {
		return <div style={container} />;
	}

	return (
		<div style={container}>
			<div style={row}>
				<div>
					<div style={title}>{video.id}</div>
					<div style={subtitle}>
						{video.width}x{video.height}
						{isCompositionStill(video) ? null : `, ${video.fps} FPS`}
					</div>
					{isCompositionStill(video) ? (
						<div style={subtitle}>Still</div>
					) : (
						<div style={subtitle}>
							Duration {renderFrame(video.durationInFrames, video.fps)}
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
