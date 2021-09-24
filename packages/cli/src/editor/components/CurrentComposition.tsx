import React, {useContext} from 'react';
import {Internals} from 'remotion';
import {FONT_FAMILY} from '../helpers/font';
import {isCompositionStill} from '../helpers/is-composition-still';
import {renderFrame} from '../state/render-frame';
import {RichTimelineContext} from '../state/rich-timeline';
import {Spacing} from './layout';
import {Thumbnail} from './Thumbnail';

const container: React.CSSProperties = {
	minHeight: 100,
	display: 'block',
	borderBottom: '1px solid black',
	padding: 16,
	color: 'white',
	lineHeight: '18px',
};

const title: React.CSSProperties = {
	fontWeight: 'bold',
	fontFamily: FONT_FAMILY,
	fontSize: 12,
	whiteSpace: 'nowrap',
};

const subtitle: React.CSSProperties = {
	fontFamily: FONT_FAMILY,
	fontSize: 12,
	opacity: 0.8,
	whiteSpace: 'nowrap',
};

const row: React.CSSProperties = {
	display: 'flex',
	flexDirection: 'row',
};

const targetHeight = 60;
const targetWidth = (targetHeight * 16) / 9;

export const CurrentComposition = () => {
	const richTimelineContext = useContext(RichTimelineContext);
	const video = Internals.useVideo();
	if (!video) {
		return <div style={container} />;
	}

	const frameToDisplay = Math.floor(video.durationInFrames / 2);
	return (
		<div style={container}>
			<div style={row}>
				{richTimelineContext.richTimeline ? (
					<>
						<Thumbnail
							composition={video}
							targetHeight={targetHeight}
							targetWidth={targetWidth}
							frameToDisplay={frameToDisplay}
						/>
						<Spacing />
					</>
				) : null}
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
