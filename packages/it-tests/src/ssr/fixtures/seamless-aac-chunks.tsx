import {Composition, Html5Audio, registerRoot, staticFile} from 'remotion';

const Clicks = () => {
	return <Html5Audio src={staticFile('clicks.wav')} />;
};

registerRoot(() => (
	<Composition
		id="seamless-aac-chunks"
		component={Clicks}
		fps={30}
		width={16}
		height={16}
		durationInFrames={150}
	/>
));
