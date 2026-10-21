import {Artifact, Composition, registerRoot, useCurrentFrame} from 'remotion';

const DuplicateArtifacts = () => {
	const frame = useCurrentFrame();
	if (frame !== 0) {
		return null;
	}

	return (
		<>
			<Artifact filename="captions.srt" content="first" />
			<Artifact filename="captions.srt" content="second" />
		</>
	);
};

registerRoot(() => (
	<Composition
		id="duplicate-artifacts"
		component={DuplicateArtifacts}
		fps={30}
		width={16}
		height={16}
		durationInFrames={2}
	/>
));
