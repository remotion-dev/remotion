import {pageTurn} from '@remotion/effects/page-turn';
import React from 'react';
import {AbsoluteFill, CanvasImage, staticFile} from 'remotion';

const PAGE_TURN_STICKER_SRC = 'img/effects-page-turn-sticker.png';

const container: React.CSSProperties = {
	backgroundColor: 'black',
};

export const EffectsPageTurnPreview: React.FC<{
	readonly progress: number;
	readonly foldPosition: readonly [number, number];
	readonly angle: number;
	readonly foldRadius: number;
	readonly lightDirection: number;
	readonly shadow: number;
	readonly backOpacity: number;
	readonly paperColor: string;
}> = ({
	progress,
	foldPosition,
	angle,
	foldRadius,
	lightDirection,
	shadow,
	backOpacity,
	paperColor,
}) => {
	return (
		<AbsoluteFill style={container}>
			<CanvasImage
				src={staticFile(PAGE_TURN_STICKER_SRC)}
				width={1280}
				height={720}
				fit="cover"
				effects={[
					pageTurn({
						progress,
						foldPosition,
						angle,
						foldRadius,
						lightDirection,
						shadow,
						backOpacity,
						paperColor,
					}),
				]}
			/>
		</AbsoluteFill>
	);
};
