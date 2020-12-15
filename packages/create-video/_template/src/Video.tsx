import {Composition} from 'remotion';
import {HelloWorld} from './HelloWorld';
import {Logo} from './HelloWorld/Logo';
import {Subtitle} from './HelloWorld/Subtitle';

export const RemotionVideo = () => {
	return (
		<>
			<Composition
				name="HelloWorld"
				component={HelloWorld}
				durationInFrames={400}
				fps={60}
				width={1920}
				height={1080}
			/>
			<Composition
				name="Logo"
				component={Logo}
				durationInFrames={400}
				fps={60}
				width={1920}
				height={1080}
			/>
			<Composition
				name="Title"
				component={Subtitle}
				durationInFrames={100}
				fps={60}
				width={1920}
				height={1080}
			/>
		</>
	);
};
