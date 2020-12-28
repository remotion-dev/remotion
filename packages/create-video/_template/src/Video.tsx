import {Composition} from 'remotion';
import {HelloWorld} from './HelloWorld';
import {Logo} from './HelloWorld/Logo';
import {Subtitle} from './HelloWorld/Subtitle';

export const RemotionVideo: React.FC = () => {
	return (
		<>
			<Composition
				name="HelloWorld"
				component={HelloWorld}
				durationInFrames={150}
				fps={30}
				width={1920}
				height={1080}
				defaultProp={{
					titleText: 'Welcome to Remotion',
					titleColor: 'black',
				}}
			/>
			<Composition
				name="Logo"
				component={Logo}
				durationInFrames={200}
				fps={30}
				width={1920}
				height={1080}
			/>
			<Composition
				name="Title"
				component={Subtitle}
				durationInFrames={100}
				fps={30}
				width={1920}
				height={1080}
			/>
		</>
	);
};
