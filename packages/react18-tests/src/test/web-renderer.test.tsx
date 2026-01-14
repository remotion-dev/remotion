import {renderStillOnWeb} from '@remotion/web-renderer';
import React, {useEffect} from 'react';
import {expect, test} from 'vitest';

test('should render still on web', async () => {
	const Component: React.FC = () => {
		return (
			<svg viewBox="0 0 100 100">
				<circle cx="50" cy="50" r="50" fill="red" />
			</svg>
		);
	};

	await renderStillOnWeb({
		licenseKey: 'free-license',
		composition: {
			component: Component,
			id: 'render-still-test',
			width: 100,
			height: 100,
			fps: 30,
			durationInFrames: 30,
			calculateMetadata: () => Promise.resolve({}),
		},
		frame: 0,
		inputProps: {},
		imageFormat: 'png',
	});

	// It worked!
});

class UseEffectError extends Error {
	name = 'UseEffectError';
}

// in react 18, errors were re-thrown
// in react 19, errors are not re-thrown and onUncaughtError was introduced
test('should propagate errors thrown in useEffect (React 18)', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	const ThrowsInUseEffect: React.FC = () => {
		useEffect(() => {
			throw new UseEffectError('Error from useEffect');
		}, []);
		return <div>Hello</div>;
	};

	await expect(
		renderStillOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: ThrowsInUseEffect,
				id: 'throws-in-useeffect-react18',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 30,
			},
			frame: 0,
			inputProps: {},
			imageFormat: 'png',
		}),
	).rejects.toThrow(UseEffectError);
});
