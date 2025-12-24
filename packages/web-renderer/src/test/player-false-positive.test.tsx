import {Player} from '@remotion/player';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {useRemotionEnvironment} from 'remotion';
import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';

const MustBePlayer: React.FC = () => {
	const {isPlayer} = useRemotionEnvironment();
	if (!isPlayer) {
		throw new Error('isPlayer is false');
	}

	return null;
};

const MustNotBePlayer: React.FC<Record<string, unknown>> = () => {
	const {isPlayer} = useRemotionEnvironment();
	if (isPlayer) {
		throw new Error('isPlayer is false');
	}

	return null;
};

test('should not give a false positive when the player is also mounted', async () => {
	const player = (
		<Player
			acknowledgeRemotionLicense
			component={MustBePlayer}
			durationInFrames={30}
			compositionWidth={100}
			compositionHeight={100}
			fps={30}
			inputProps={{}}
		/>
	);

	const div = document.createElement('div');
	const root = createRoot(div);

	flushSync(() => {
		root.render(player);
	});

	await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: MustNotBePlayer,
			id: 'player-false-positive-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 30,
			calculateMetadata: () => Promise.resolve({}),
		},
		frame: 20,
		inputProps: {},
		imageFormat: 'png',
	});
});
