import {Button} from '@remotion/design';
import React, {useCallback, useRef, useState} from 'react';

export const PlayButton: React.FC<{
	readonly src: string;
	readonly size?: number;
	readonly depth?: number;
}> = ({src, size = 48, depth}) => {
	const [playing, setPlaying] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);

	const iconSize = Math.round(size * 0.5);

	const toggle = useCallback(
		(e: React.MouseEvent) => {
			e.preventDefault();
			e.stopPropagation();
			if (playing) {
				audioRef.current?.pause();
				if (audioRef.current) {
					audioRef.current.currentTime = 0;
				}
				setPlaying(false);
			} else {
				const audio = new Audio(src);
				audioRef.current = audio;
				audio.play();
				audio.addEventListener('ended', () => {
					setPlaying(false);
				});
				setPlaying(true);
			}
		},
		[playing, src],
	);

	return (
		<div style={{width: size, height: size}}>
			<Button
				className={`rounded-full p-0`}
				style={{width: size, height: size}}
				onClick={toggle}
				title={playing ? 'Stop' : 'Play'}
				depth={depth}
			>
				{playing ? (
					<svg
						width={iconSize}
						height={iconSize}
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<rect x="6" y="4" width="4" height="16" />
						<rect x="14" y="4" width="4" height="16" />
					</svg>
				) : (
					<svg
						width={iconSize}
						height={iconSize}
						viewBox="0 0 24 24"
						fill="currentColor"
					>
						<polygon points="6,4 20,12 6,20" />
					</svg>
				)}
			</Button>
		</div>
	);
};
