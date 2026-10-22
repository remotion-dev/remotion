import {useEffect, useState} from 'react';
import {useCurrentFrame, useDelayRender} from 'remotion';
import {expect, test} from 'vitest';
import {renderMediaOnWeb} from '../render-media-on-web';
import {renderStillOnWeb} from '../render-still-on-web';
import '../symbol-dispose';
import {testImage} from './utils';

test('should render still on web', async () => {
	const Component: React.FC = () => {
		return (
			<svg viewBox="0 0 100 100">
				<circle cx="50" cy="50" r="50" fill="red" />
			</svg>
		);
	};

	const blob = await (
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
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'test-img'});
});

test('should be able to read frame number', async () => {
	const Component: React.FC = () => {
		const frame = useCurrentFrame();
		return (
			<svg viewBox="0 0 100 100">
				<text x="50" y="50" textAnchor="middle" fill="blue">
					{frame}
				</text>
			</svg>
		);
	};

	const blob = await (
		await renderStillOnWeb({
			licenseKey: 'free-license',
			composition: {
				component: Component,
				id: 'frame-number-test',
				width: 100,
				height: 100,
				fps: 30,
				durationInFrames: 30,
			},
			frame: 20,
			inputProps: {},
		})
	).blob({format: 'png'});

	await testImage({blob, testId: 'frame-number'});
});

test('should render a still while a media render is in progress', async (t) => {
	if (t.task.file.projectName === 'webkit') {
		t.skip();
		return;
	}

	let notifyMediaStarted: () => void = () => undefined;
	const mediaStarted = new Promise<void>((resolve) => {
		notifyMediaStarted = resolve;
	});
	let notifyStillStarted: () => void = () => undefined;
	const stillStarted = new Promise<void>((resolve) => {
		notifyStillStarted = resolve;
	});
	let releaseMedia: () => void = () => undefined;
	const mediaReleased = new Promise<void>((resolve) => {
		releaseMedia = resolve;
	});

	const Component: React.FC<{type: 'media' | 'still'}> = ({type}) => {
		const {delayRender, continueRender} = useDelayRender();
		const [handle] = useState(() =>
			type === 'media' ? delayRender('Waiting to release media render') : null,
		);

		useEffect(() => {
			if (type === 'still') {
				notifyStillStarted();
				return;
			}

			notifyMediaStarted();
			mediaReleased.then(() => continueRender(handle!));
		}, [continueRender, handle, type]);

		return <div style={{width: 100, height: 100, backgroundColor: 'red'}} />;
	};

	const composition = {
		component: Component,
		id: 'parallel-media-and-still-test',
		width: 100,
		height: 100,
		fps: 30,
		durationInFrames: 1,
		defaultProps: {type: 'media' as const},
	};

	const mediaRender = renderMediaOnWeb({
		licenseKey: 'free-license',
		composition,
		inputProps: {type: 'media' as const},
		outputTarget: 'arraybuffer',
	});
	await mediaStarted;

	const stillRender = renderStillOnWeb({
		licenseKey: 'free-license',
		composition,
		frame: 0,
		inputProps: {type: 'still' as const},
	});
	const stillStartedBeforeMediaFinished = await Promise.race([
		stillStarted.then(() => true),
		new Promise<false>((resolve) => {
			setTimeout(() => resolve(false), 5000);
		}),
	]);

	releaseMedia();
	await Promise.all([mediaRender, stillRender]);

	expect(stillStartedBeforeMediaFinished).toBe(true);
});
