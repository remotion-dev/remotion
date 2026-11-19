import {afterEach, expect, test} from 'bun:test';
import {cleanup, render} from '@testing-library/react';
import React from 'react';
import {AbsoluteFill, Html5Audio, Internals} from 'remotion';
import {Player} from '../Player.js';

afterEach(() => {
	cleanup();
});

const AUDIO_SRC = 'https://example.com/beep.mp3';

const Sound: React.FC = () => {
	return <Html5Audio src={AUDIO_SRC} />;
};

const MyComp: React.FC<{
	readonly version: string;
	readonly mounted: boolean;
}> = ({version, mounted}) => {
	return (
		<Internals.SequenceManagerProvider>
			<AbsoluteFill>{mounted ? <Sound key={version} /> : null}</AbsoluteFill>
		</Internals.SequenceManagerProvider>
	);
};

test('Player keeps Html5Audio src after parent component remounts via key change', () => {
	const {container, rerender} = render(
		<Player
			component={MyComp}
			inputProps={{version: 'a', mounted: false}}
			durationInFrames={300}
			fps={30}
			compositionWidth={320}
			compositionHeight={180}
			acknowledgeRemotionLicense
		/>,
	);

	const getAudioSrcs = () =>
		Array.from(container.querySelectorAll('audio')).map((audio) => audio.src);

	rerender(
		<Player
			component={MyComp}
			inputProps={{version: 'a', mounted: true}}
			durationInFrames={300}
			fps={30}
			compositionWidth={320}
			compositionHeight={180}
			acknowledgeRemotionLicense
		/>,
	);

	expect(getAudioSrcs().filter((src) => src === AUDIO_SRC)).toHaveLength(1);

	rerender(
		<Player
			component={MyComp}
			inputProps={{version: 'b', mounted: true}}
			durationInFrames={300}
			fps={30}
			compositionWidth={320}
			compositionHeight={180}
			acknowledgeRemotionLicense
		/>,
	);

	expect(getAudioSrcs().filter((src) => src === AUDIO_SRC)).toHaveLength(1);
});
