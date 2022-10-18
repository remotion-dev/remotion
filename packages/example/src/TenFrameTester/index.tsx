import {AbsoluteFill, Audio, staticFile} from 'remotion';
import ReactSvg from '../ReactSvg';

// Short video that is fast to render for testing
export const TenFrameTester: React.FC = () => (
	<AbsoluteFill>
		<ReactSvg transparent={false} />
		<Audio src={staticFile('music.mp3')} />
	</AbsoluteFill>
);
