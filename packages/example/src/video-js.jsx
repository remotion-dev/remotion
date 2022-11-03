import {Composition} from 'remotion';
import {Framer} from './FramerJs';

export const Index = () => {
	return (
		<>
			<Composition
				id="framer"
				component={Framer}
				width={1080}
				height={1080}
				fps={30}
				durationInFrames={100}
			/>
		</>
	);
};
