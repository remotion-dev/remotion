import {AbsoluteFill, Html5Audio} from 'remotion';
import ReactSvg from '../ReactSvg';

// Short video that is fast to render for testing
export const TenFrameTester: React.FC = () => (
	<AbsoluteFill>
		<ReactSvg transparent={false} />
		<Html5Audio src="https://remotion.media/music.mp3" />
	</AbsoluteFill>
);
