import {getInputProps} from 'remotion';
import {expect, test} from 'vitest';
import {renderStillOnWeb} from '../render-still-on-web';

const MustAcceptInputProps: React.FC<{
	abc: string;
}> = ({abc}) => {
	if (abc !== 'abc') {
		throw new Error('abc is not abc');
	}

	return abc;
};

const DisallowGetInputProps: React.FC<{}> = () => {
	getInputProps();
	return null;
};

test('cannot call getInputProps() while rendering client-side', async () => {
	await renderStillOnWeb({
		Component: MustAcceptInputProps,
		width: 100,
		height: 100,
		fps: 30,
		durationInFrames: 30,
		frame: 20,
		inputProps: {abc: 'abc'},
	});
});

test('cannot call getInputProps() while rendering client-side', async () => {
	await expect(() => {
		return renderStillOnWeb({
			Component: DisallowGetInputProps,
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 30,
			frame: 20,
			inputProps: {abc: 'abc'},
		});
	}).rejects.toThrow(
		'Cannot call `getInputProps()` - window.remotion_inputProps is not set. This API is only available if you are in the Studio, or while you are rendering server-side.',
	);
});
