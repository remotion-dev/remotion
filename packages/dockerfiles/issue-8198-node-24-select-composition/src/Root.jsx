import {AbsoluteFill, Composition, registerRoot} from 'remotion';

const Issue8198 = () => {
	return (
		<AbsoluteFill
			style={{
				alignItems: 'center',
				backgroundColor: '#111827',
				color: 'white',
				fontFamily: 'Arial, sans-serif',
				fontSize: 64,
				justifyContent: 'center',
			}}
		>
			Node 24.16.0 SSR
		</AbsoluteFill>
	);
};

const RemotionRoot = () => {
	return (
		<Composition
			component={Issue8198}
			durationInFrames={30}
			fps={30}
			height={720}
			id="Issue8198"
			width={1280}
		/>
	);
};

registerRoot(RemotionRoot);
