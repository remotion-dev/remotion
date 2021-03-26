import React, {Suspense, useContext, useMemo} from 'react';
import {Internals, TComposition, TimelineContextValue} from 'remotion';
import {
	checkerboardBackgroundColor,
	checkerboardBackgroundImage,
	CHECKERBOARD_BACKGROUND_POS,
	CHECKERBOARD_BACKGROUND_SIZE,
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
			backgroundPosition: CHECKERBOARD_BACKGROUND_POS(25),
			backgroundSize: CHECKERBOARD_BACKGROUND_SIZE(25),
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
			isThumbnail: false,
		};
	}, [frameToDisplay]);

	const props = useMemo(() => {
		return ((composition.props as unknown) as {}) ?? {};
	}, [composition.props]);

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
