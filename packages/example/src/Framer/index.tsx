import {AbsoluteFill, OffthreadVideo, random, staticFile} from 'remotion';

export function selectColor(color: string, frame: number): number {
	return Math.floor((random(`${color}-${frame}`) * 255) % 255);
}

export const Framer: React.FC<{
	playbackRate?: number;
}> = ({playbackRate}) => {
	return (
		<AbsoluteFill style={{backgroundColor: '#00BDF2'}}>
			<OffthreadVideo style={{height: 400}} src={staticFile('blue.mp4')} />
		</AbsoluteFill>
	);
};
