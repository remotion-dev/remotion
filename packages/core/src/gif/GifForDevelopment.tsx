import {Canvas, useWorkerParser} from '@react-gifs/tools';
import React, {useState} from 'react';
import {RemotionGifProps, GifState} from './props';
import { useCurrentGifIndex } from './useCurrentGifIndex';


export const GifForDevelopment = ({
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

	useWorkerParser(src, (info) => update(info));

	const index = useCurrentGifIndex(state.delays);

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
