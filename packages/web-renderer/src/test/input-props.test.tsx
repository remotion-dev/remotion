import {getInputProps, useVideoConfig} from 'remotion';
import {expect, test} from 'vitest';
import {makeInternalState} from '../internal-state';
import {renderStillOnWeb} from '../render-still-on-web';

const MustAcceptInputProps: React.FC<{
	abc: string;
}> = ({abc}) => {
	if (abc !== 'abc') {
		throw new Error('abc is not abc');
	}

	const {props, defaultProps} = useVideoConfig();

	if (JSON.stringify(defaultProps) !== JSON.stringify({})) {
		throw new Error('Expected defaultProps to be empty');
	}

	if (JSON.stringify(props) !== JSON.stringify({abc: 'abc'})) {
		throw new Error('Expected props to be {abc: "abc"}');
	}

	return abc;
};

const DisallowGetInputProps: React.FC<{}> = () => {
	getInputProps();
	return null;
};

const HasNoProps: React.FC<{}> = () => {
	return null;
};

const HasProps: React.FC<{abc: 'def'}> = () => {
	return null;
};

test('cannot call getInputProps() while rendering client-side', async () => {
	await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: MustAcceptInputProps,
			id: 'input-props-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 30,
			defaultProps: {abc: 'abc'},
		},
		frame: 20,
		inputProps: {abc: 'abc'},
		imageFormat: 'png',
	});
});

test('cannot call getInputProps() while rendering client-side', async () => {
	await expect(() => {
		return renderStillOnWeb({
			composition: {
				component: DisallowGetInputProps,
				id: 'input-props-test',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 30,
				defaultProps: {abc: 'abc'},
			},
			frame: 20,
			inputProps: {abc: 'abc'},
			imageFormat: 'png',
		});
	}).rejects.toThrow(
		'Cannot call `getInputProps()` - window.remotion_inputProps is not set. This API is only available if you are in the Studio, or while you are rendering server-side.',
	);
});

type MockSignature = typeof renderStillOnWeb;
const mockFn: MockSignature = () =>
	Promise.resolve({blob: new Blob(), internalState: makeInternalState()});

test('Should be able to omit input props when component accepts no props', () => {
	mockFn({
		composition: {
			component: HasNoProps,
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 30,
			calculateMetadata: () => Promise.resolve({}),
			id: 'input-props-test',
		},
		frame: 20,
		imageFormat: 'png',
	});
});

test('Should not be able to omit input props when component accepts props', () => {
	// @ts-expect-error - inputProps is required
	mockFn({
		composition: {
			component: HasProps,
			width: 100,
			height: 100,
			id: 'input-props-test',
			fps: 30,
			durationInFrames: 30,
			defaultProps: {abc: 'def'},
		},
		frame: 20,
		imageFormat: 'png',
	});

	mockFn({
		composition: {
			component: HasProps,
			id: 'input-props-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 30,
			defaultProps: {abc: 'def'},
		},
		frame: 20,
		inputProps: {
			// @ts-expect-error - must match signature
			abc: 'efg',
		},
		imageFormat: 'png',
	});

	// No error, how it should be :)
	mockFn({
		composition: {
			component: HasProps,
			id: 'input-props-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 30,
			defaultProps: {abc: 'def'},
		},
		frame: 20,
		inputProps: {
			abc: 'def',
		},
		imageFormat: 'png',
	});
});
