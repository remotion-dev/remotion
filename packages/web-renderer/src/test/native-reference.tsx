import {Player} from '@remotion/player';
import type {} from '@vitest/browser-playwright';
import type {ComponentType} from 'react';
import {useContext} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Internals} from 'remotion';
import {page} from 'vitest/browser';

type Fixture = {
	component: ComponentType;
	id: string;
	width: number;
	height: number;
	fps: number;
	durationInFrames: number;
};

// Capture browser painting, not another invocation of the DOM composer.
// Fixtures must be deterministic and finish async work through Player buffering.
export const captureNativeReference = async (
	fixture: Fixture,
	frame = 0,
	{omitBackground = true}: {omitBackground?: boolean} = {},
) => {
	const host = document.createElement('div');
	host.dataset.testid = `${fixture.id}-native-${frame}`;
	Object.assign(host.style, {
		width: `${fixture.width}px`,
		height: `${fixture.height}px`,
		position: 'relative',
	});
	document.body.appendChild(host);
	const root = createRoot(host);
	let readBuffering: () => boolean;
	const Component = fixture.component;
	const Reference = () => {
		readBuffering = useContext(Internals.SetTimelineContext).isBuffering;
		return <Component />;
	};

	try {
		flushSync(() => {
			root.render(
				<Player
					component={Reference}
					compositionWidth={fixture.width}
					compositionHeight={fixture.height}
					fps={fixture.fps}
					durationInFrames={fixture.durationInFrames}
					initialFrame={frame}
					style={{width: fixture.width, height: fixture.height}}
					acknowledgeRemotionLicense
				/>,
			);
		});
		await document.fonts.ready;
		await Promise.all(
			Array.from(host.querySelectorAll('img'), (img) => img.decode()),
		);
		const deadline = performance.now() + 10000;
		do {
			await new Promise<void>((resolve) =>
				requestAnimationFrame(() => resolve()),
			);
			if (performance.now() > deadline)
				throw new Error('Native reference remained buffering');
		} while (readBuffering!());

		const {base64} = await page.getByTestId(host.dataset.testid).screenshot({
			base64: true,
			omitBackground,
			scale: 'css',
			style:
				'html, body, iframe[data-vitest] { background: transparent !important; }',
		});
		return new Blob(
			[Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))],
			{type: 'image/png'},
		);
	} finally {
		root.unmount();
		host.remove();
	}
};

const decodePixels = async (blob: Blob) => {
	const bitmap = await createImageBitmap(blob);
	try {
		const canvas = document.createElement('canvas');
		canvas.width = bitmap.width;
		canvas.height = bitmap.height;
		const context = canvas.getContext('2d')!;
		context.drawImage(bitmap, 0, 0);
		return context.getImageData(0, 0, bitmap.width, bitmap.height);
	} finally {
		bitmap.close();
	}
};

// No perceptual threshold, antialias exclusion, or alpha-channel exception.
export const compareNativePixels = async (reference: Blob, actual: Blob) => {
	const [expected, received] = await Promise.all([
		decodePixels(reference),
		decodePixels(actual),
	]);
	if (
		expected.width !== received.width ||
		expected.height !== received.height
	) {
		throw new Error(
			`Dimensions differ: ${expected.width}x${expected.height} vs ${received.width}x${received.height}`,
		);
	}

	const diff = new ImageData(expected.width, expected.height);
	let mismatchedPixels = 0;
	let maxChannelDelta = 0;
	for (let offset = 0; offset < expected.data.length; offset += 4) {
		let differs = false;
		for (let channel = 0; channel < 4; channel++) {
			const delta = Math.abs(
				expected.data[offset + channel] - received.data[offset + channel],
			);
			if (delta !== 0) differs = true;
			maxChannelDelta = Math.max(maxChannelDelta, delta);
		}

		if (differs) {
			mismatchedPixels++;
			diff.data.set([255, 0, 255, 255], offset);
		}
	}

	const canvas = document.createElement('canvas');
	canvas.width = expected.width;
	canvas.height = expected.height;
	canvas.getContext('2d')!.putImageData(diff, 0, 0);
	const diffBlob = await new Promise<Blob>((resolve) =>
		canvas.toBlob((blob) => resolve(blob!), 'image/png'),
	);
	return {mismatchedPixels, maxChannelDelta, diff: diffBlob};
};

export const savePixelEvidence = async (
	blob: Blob,
	testId: string,
	{omitBackground = true}: {omitBackground?: boolean} = {},
) => {
	const image = document.createElement('img');
	const url = URL.createObjectURL(blob);
	image.src = url;
	image.dataset.testid = testId;
	image.style.display = 'block';
	document.body.appendChild(image);
	try {
		await image.decode();
		return await page.getByTestId(testId).screenshot({
			omitBackground,
			scale: 'css',
			style:
				'html, body, iframe[data-vitest] { background: transparent !important; }',
		});
	} finally {
		image.remove();
		URL.revokeObjectURL(url);
	}
};
