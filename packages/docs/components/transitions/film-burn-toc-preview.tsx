import React from 'react';
import {staticFile} from 'remotion';
import {
	presentationCompositionHeight,
	presentationCompositionWidth,
} from '../TableOfContents/transitions/presentations';

export const FilmBurnTocPreview: React.FC = () => {
	const tileHeight = 60;
	const tileWidth =
		(tileHeight * presentationCompositionWidth) / presentationCompositionHeight;
	const sharedStyle: React.CSSProperties = {
		width: tileWidth,
		height: tileHeight,
		flex: 'none',
		borderRadius: 6,
		display: 'block',
		objectFit: 'cover',
	};

	return (
		<video
			muted
			playsInline
			preload="auto"
			src={staticFile('img/film-burn-transition-thumb.mp4')}
			style={sharedStyle}
			onPointerEnter={(event) => {
				const video = event.currentTarget;
				video.currentTime = 0;
				video.play();
			}}
		/>
	);
};
