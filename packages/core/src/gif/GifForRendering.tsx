import {Canvas, useParser} from '@react-gifs/tools';
import React, {useState} from 'react';
import {continueRender, delayRender} from '../ready-manager';
import {GifState, RemotionGifProps} from './props';
import {useCurrentGifIndex} from './useCurrentGifIndex';

export const GifForRendering = ({
	src,
	width,
	height,
	fit = 'fill',
	...props
}: RemotionGifProps) => {
	const [state, update] = useState<GifState>({
		delays: [],
		frames: [],
		width: 0,
		height: 0,
	});

	const [id] = useState(() => delayRender());

	const index = useCurrentGifIndex(state.delays);

	useParser(src, (info) => {
		continueRender(id);
		update(info);
	});

	return (
		<Canvas
			fit={fit}
			index={index}
			frames={state.frames}
			width={width ?? state.width}
			height={height ?? state.height}
			{...props}
		/>
	);
};
