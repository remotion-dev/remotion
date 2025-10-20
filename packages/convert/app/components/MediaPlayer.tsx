import {MediaFox} from '@mediafox/core';
import {useEffect, useMemo, useRef, useState} from 'react';
import type {Source} from '~/lib/convert-state';
import {PlayerVolume} from './player/mute-button';
import {PlayPauseButton} from './player/play-button';
import {PlayerSeekBar} from './player/player-seekbar';
import {TimeDisplay} from './player/time-display';

const Separator: React.FC = () => {
	return (
		<div
			style={{
				borderRight: `2px solid black`,
				height: 50,
			}}
		/>
	);
};

export function VideoPlayer({src: source}: {readonly src: Source}) {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	const playerRef = useRef<MediaFox>(null);

	const src = useMemo(() => {
		if (source.type === 'url') {
			return source.url;
		}

		return source.file;
	}, [source]);

	const [mediaFox, setMediaFox] = useState<MediaFox | null>(null);

	useEffect(() => {
		const player = new MediaFox({
			renderTarget: canvasRef.current!,
		});
		setMediaFox(player);

		playerRef.current = player;

		// Load media
		player.load(src).then(() => {});

		return () => {
			player.dispose();
		};
	}, [src]);

	return (
		<div
			style={{maxWidth: 732}}
			className="border-2 border-b-4 border-black rounded-md overflow-hidden"
		>
			<canvas ref={canvasRef} style={{width: '100%'}} />
			{mediaFox ? (
				<div className="flex row border-t-2 border-t-black items-center ">
					<PlayPauseButton playerRef={mediaFox} />
					<Separator />
					<PlayerVolume playerRef={mediaFox} />
					<Separator />
					<div style={{width: 15}} />
					<TimeDisplay playerRef={mediaFox} />
					<div style={{width: 15}} />
					<PlayerSeekBar playerRef={mediaFox} />
					<div style={{width: 15}} />
				</div>
			) : null}
		</div>
	);
}
