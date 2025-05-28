import type {MediaParserDimensions} from '@remotion/media-parser';
import React, {useEffect, useRef, useState} from 'react';
import type {Source} from '~/lib/convert-state';
import {playVideo} from './play-video';
import {PlayerControls} from './PlayerControls';

export const VideoPlayer: React.FC<{
	readonly src: Source;
}> = ({src}) => {
	const [dimensions, setDimensions] = useState<
		MediaParserDimensions | null | undefined
	>(undefined);
	const [player, setPlayer] = useState<Player | null>(null);
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const controller = new AbortController();
		const playerInstance = playVideo({
			src: src.type === 'file' ? src.file : src.url,
			signal: controller.signal,
			onDimensions: (dim) => {
				setDimensions(dim);
			},
			onError: console.error,
			drawFrame: (frame) => {
				canvasRef.current?.getContext('2d')?.drawImage(frame, 0, 0);
			},
		});
		setPlayer(playerInstance);

		return () => {
			controller.abort();
		};
	}, [src]);

	if (!dimensions) {
		return null;
	}

	if (!player) {
		return null;
	}

	return (
		<div
			style={{
				backgroundColor: 'black',
				width: '100%',
				aspectRatio: `${dimensions.width} / ${dimensions.height}`,
				position: 'relative',
			}}
		>
			<canvas
				ref={canvasRef}
				style={{
					width: '100%',
					height: 'auto',
					aspectRatio: `${dimensions.width} / ${dimensions.height}`,
					display: 'block',
					position: 'absolute',
				}}
				width={dimensions.width}
				height={dimensions.height}
			/>
			<PlayerControls pause={player.pause} play={player.play} />
		</div>
	);
};
