import {Composition} from 'remotion';
import {Banner} from './Banner';
import {Comp} from './Composition';
import {TriangleDemo} from './TriangleToSquare';

export const RemotionRoot: React.FC = () => {
	return (
		<>
			<Composition
				id="LightMode"
				component={Comp}
				durationInFrames={120}
				fps={30}
				width={1080}
				height={1080}
				defaultProps={{
					theme: 'light',
				}}
			/>
			<Composition
				id="LightModeBanner"
				component={Banner}
				durationInFrames={120}
				fps={30}
				width={1080}
				height={540}
				defaultProps={{
					theme: 'light',
				}}
			/>
			<Composition
				id="DarkMode"
				component={Comp}
				durationInFrames={120}
				fps={30}
				width={1080}
				height={1080}
				defaultProps={{
					theme: 'dark',
				}}
			/>
			<Composition
				id="DarkModeBanner"
				component={Banner}
				durationInFrames={120}
				fps={30}
				width={1080}
				height={540}
				defaultProps={{
					theme: 'dark',
				}}
			/>
			<Composition
				id="TriangletoSwquare"
				component={TriangleDemo}
				durationInFrames={240}
				fps={30}
				width={1080}
				height={1080}
				defaultProps={{theme: 'light'}}
			/>
		</>
	);
};
