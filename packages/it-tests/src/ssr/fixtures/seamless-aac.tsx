import {Composition, Html5Audio, registerRoot, Sequence} from 'remotion';

const Audio = ({src}: {src: string}) => {
	return (
		<Sequence from={359} durationInFrames={90}>
			<Html5Audio src={src} volume={0.2} />
		</Sequence>
	);
};

registerRoot(() => (
	<Composition
		id="seamless-aac"
		component={Audio}
		fps={25}
		width={16}
		height={16}
		durationInFrames={450}
		defaultProps={{src: ''}}
	/>
));
