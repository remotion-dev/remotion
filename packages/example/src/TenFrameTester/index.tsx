import {useContext} from 'react';
import {AbsoluteFill, Audio, Internals, staticFile} from 'remotion';
import ReactSvg from '../ReactSvg';

// Short video that is fast to render for testing
export const TenFrameTester: React.FC = () => {
	console.log('frame', useContext(Internals.Timeline.TimelineContext).frame);

	return (
		<AbsoluteFill>
			<AbsoluteFill
				style={{
					width: 1080,
					height: 1080,
					transform: `scale(0.3)`,
				}}
			>
				<ReactSvg transparent={false} />
			</AbsoluteFill>
			<Audio src={staticFile('music.mp3')} />
		</AbsoluteFill>
	);
};
