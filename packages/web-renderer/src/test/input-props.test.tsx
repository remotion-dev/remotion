import {test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';

const MustNotBePlayer: React.FC<{
	abc: string;
}> = ({abc}) => {
	if (abc !== 'abc') {
		throw new Error('abc is not abc');
	}

	return abc;
};

test('should not give a false positive when the player is also mounted', async () => {
	await renderStillOnWeb({
		Component: MustNotBePlayer,
		width: 100,
		height: 100,
		fps: 30,
		durationInFrames: 30,
		frame: 20,
		inputProps: {abc: 'abc'},
	});
});
