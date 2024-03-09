import {reEncodeVideo} from '@remotion/browser-renderer';
import {Audio, random, staticFile, useCurrentFrame} from 'remotion';

export function selectColor(color: string, frame: number): number {
	return Math.floor((random(`${color}-${frame}`) * 255) % 255);
}

export const Framer: React.FC = () => {
	const frame = useCurrentFrame();

	const red = selectColor('red', frame);
	const green = selectColor('green', frame);
	const blue = selectColor('blue', frame);

	return (
		<div
			style={{
				display: 'flex',
				justifyContent: 'center',
				alignItems: 'center',
				background: 'white',
				flex: 1,
				borderTop: `100px solid rgb(${red}, ${green}, ${blue})`,
				paddingBottom: 100,
			}}
		>
			<input
				type="file"
				onChange={(e) => reEncodeVideo(e.target.files?.[0] as File)}
			/>
			<h1 style={{fontSize: 120}}>{frame} 😁</h1>
			<Audio src={staticFile('sine.wav')} />
		</div>
	);
};
