import React, {useState} from 'react';
import {LRUMap} from 'lru_map';
import {Canvas, useWorkerParser} from '@react-gifs/tools';
import {GifState, RemotionGifProps} from './props';
import {useCurrentGifIndex} from './useCurrentGifIndex';

const cache = new LRUMap<string, GifState>(30);

export const GifForDevelopment = ({
	src,
	width,
	height,
	fit = 'fill',
	...props
}: RemotionGifProps) => {
	const [state, update] = useState<GifState>(() => {
		const parcedGif = cache.get(src);

		if (parcedGif == null) {
			return {
				delays: [],
				frames: [],
				width: 0,
				height: 0,
			};
		}

		return parcedGif;
	});

  // skip loading if frames exist
	useWorkerParser(!!state.frames.length || src, (info) => {
		cache.set(src, info);
		update(info);
	});

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
