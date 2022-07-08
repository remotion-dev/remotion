import React, {Suspense, useContext, useMemo, useState} from 'react';
import type { TComposition, TimelineContextValue} from 'remotion';
import {Internals, random} from 'remotion';
import {
	checkerboardBackgroundColor,
	checkerboardBackgroundImage,
	getCheckerboardBackgroundPos,
} from '../helpers/checkerboard-background';
import {CheckerboardContext} from '../state/checkerboard';

export const Thumbnail: React.FC<{
	composition: TComposition<unknown>;
	targetHeight: number;
	targetWidth: number;
	frameToDisplay: number;
}> = ({composition, targetHeight, targetWidth, frameToDisplay}) => {
	const {height, width} = composition;
	const heightRatio = targetHeight / height;
	const widthRatio = targetWidth / width;
	const ratio = Math.min(heightRatio, widthRatio);
	const scale = ratio;
	const actualWidth = width * scale;
	const actualHeight = height * scale;
	const correction = 0 - (1 - scale) / 2;
	const xCorrection = correction * width;
	const yCorrection = correction * height;

	const [thumbnailId] = useState(() => String(random(null)));

	const {checkerboard} = useContext(CheckerboardContext);

	const container: React.CSSProperties = useMemo(() => {
		return {
			width: targetWidth,
			height: targetHeight,
			backgroundColor: 'rgba(0, 0, 0, 0.4)',
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center',
		};
	}, [targetHeight, targetWidth]);

	const outer: React.CSSProperties = useMemo(() => {
		return {
			width: actualWidth,
			height: actualHeight,
			backgroundColor: checkerboardBackgroundColor(checkerboard),
			backgroundImage: checkerboardBackgroundImage(checkerboard),
			backgroundPosition: getCheckerboardBackgroundPos(25),
			backgroundSize: getCheckerboardBackgroundPos(25),
		};
	}, [actualHeight, actualWidth, checkerboard]);

	const inner: React.CSSProperties = useMemo(() => {
		return {
			width,
			height,
			transform: `scale(${scale}) `,
			overflow: 'hidden',
			marginLeft: xCorrection,
			marginTop: yCorrection,
			display: 'flex',
			color: 'black',
		};
	}, [height, scale, width, xCorrection, yCorrection]);

	const timelineState: TimelineContextValue = useMemo(() => {
		return {
			playing: false,
			frame: frameToDisplay,
			rootId: thumbnailId,
			imperativePlaying: {
				current: false,
			},
			playbackRate: 1,
			setPlaybackRate: () => {
				throw new Error('thumbnail');
			},
			audioAndVideoTags: {current: []},
		};
	}, [frameToDisplay, thumbnailId]);

	const props = useMemo(() => {
		return (composition.defaultProps as unknown as {}) ?? {};
	}, [composition.defaultProps]);

	const ThumbnailComponent = composition.component;

	return (
		<div style={container}>
			<Suspense fallback={null}>
				<div style={outer}>
					<div style={inner}>
						<Internals.Timeline.TimelineContext.Provider value={timelineState}>
							<ThumbnailComponent {...props} />
						</Internals.Timeline.TimelineContext.Provider>
					</div>
				</div>
			</Suspense>
		</div>
	);
};
