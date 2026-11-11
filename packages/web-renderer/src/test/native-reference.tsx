import {Player} from '@remotion/player';
import type {} from '@vitest/browser-playwright';
import type {ComponentType} from 'react';
import {useContext} from 'react';
import {flushSync} from 'react-dom';
import {createRoot} from 'react-dom/client';
import {Internals} from 'remotion';
import {expect} from 'vitest';
import {page, server} from 'vitest/browser';

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
	{
		omitBackground = true,
		screenshotTimeout,
	}: {omitBackground?: boolean; screenshotTimeout?: number} = {},
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

		// `save: false` skips writing the PNG to disk. Vitest 5.0.3 then resolves
		// to the base64 string even though its types still declare {path, base64}.
		const screenshot: string | {base64: string} = await page
			.getByTestId(host.dataset.testid)
			.screenshot({
				base64: true,
				save: false,
				omitBackground,
				timeout: screenshotTimeout,
				scale: 'css',
				style:
					'html, body, iframe[data-vitest] { background: transparent !important; }',
			});
		const base64 =
			typeof screenshot === 'string' ? screenshot : screenshot.base64;
		return new Blob(
			[Uint8Array.from(atob(base64), (char) => char.charCodeAt(0))],
			{type: 'image/png'},
		);
	} finally {
		root.unmount();
		host.remove();
	}
};

// The first paint of some content in a fresh page is much slower than later
// ones. On macOS CI runners (ANGLE Metal on a paravirtual GPU), screenshotting
// blend modes for the first time blocked the page for up to 5s. Paint each
// fixture once in beforeAll() so that cost is not charged to a test's timeout.
export const warmUpNativeReferences = async (
	fixtures: Parameters<typeof captureNativeReference>[0][],
) => {
	for (const fixture of fixtures) {
		// The test browser's 5s action timeout would otherwise also cap this
		// slow first screenshot, whatever the hook timeout is.
		await captureNativeReference(fixture, 0, {screenshotTimeout: 30_000});
	}
};

const decodePixels = async (blob: Blob) => {
	const bitmap = await createImageBitmap(blob);
	try {
		const canvas = document.createElement('canvas');
		canvas.width = bitmap.width;
		canvas.height = bitmap.height;
		const context = canvas.getContext('2d', {willReadFrequently: true})!;
		context.drawImage(bitmap, 0, 0);
		return context.getImageData(0, 0, bitmap.width, bitmap.height);
	} finally {
		bitmap.close();
	}
};

// No perceptual threshold, antialias exclusion, or alpha-channel exception.
const compareNativePixelData = async (
	reference: Blob,
	actual: Blob,
	createDiff: boolean,
) => {
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

	let diff: ImageData | null = null;
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
			if (createDiff) {
				diff ??= new ImageData(expected.width, expected.height);
				diff.data.set([255, 0, 255, 255], offset);
			}
		}
	}

	return {
		mismatchedPixels,
		maxChannelDelta,
		diff,
		width: expected.width,
		height: expected.height,
	};
};

// A matching comparison has an all-transparent diff, so encode it once per size.
const emptyDiffs = new Map<string, Promise<Blob>>();

export const countNativePixels = async (reference: Blob, actual: Blob) => {
	const {mismatchedPixels, maxChannelDelta} = await compareNativePixelData(
		reference,
		actual,
		false,
	);
	return {mismatchedPixels, maxChannelDelta};
};

export const compareNativePixels = async (reference: Blob, actual: Blob) => {
	const {mismatchedPixels, maxChannelDelta, diff, width, height} =
		await compareNativePixelData(reference, actual, true);
	const encodeDiff = (imageData: ImageData | null) => {
		const canvas = document.createElement('canvas');
		canvas.width = width;
		canvas.height = height;
		if (imageData) canvas.getContext('2d')!.putImageData(imageData, 0, 0);
		return new Promise<Blob>((resolve) =>
			canvas.toBlob((blob) => resolve(blob!), 'image/png'),
		);
	};

	const emptyKey = `${width}x${height}`;
	if (!diff && !emptyDiffs.has(emptyKey)) {
		emptyDiffs.set(emptyKey, encodeDiff(null));
	}

	const diffBlob = await (diff ? encodeDiff(diff) : emptyDiffs.get(emptyKey)!);
	let evidence: string | null = null;
	if (mismatchedPixels > 0) {
		const testName = expect.getState().currentTestName ?? 'native-pixels';
		const originals = await Promise.all(
			[reference, actual, diffBlob].map(async (blob) => {
				const bytes = new Uint8Array(await blob.arrayBuffer());
				const hash = new Uint8Array(
					await crypto.subtle.digest('SHA-256', bytes),
				);
				let binary = '';
				for (const byte of bytes) binary += String.fromCharCode(byte);
				return {
					base64: btoa(binary),
					sha256: Array.from(hash, (byte) =>
						byte.toString(16).padStart(2, '0'),
					).join(''),
				};
			}),
		);
		evidence = `src/test/__screenshots__/native-pixel-failures/${server.browser}/${testName.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80)}-${originals[0].sha256}-${originals[1].sha256}`;
		await Promise.all(
			['reference', 'actual', 'diff'].map((name, index) =>
				server.commands.writeFile(
					`${evidence}/${name}.png`,
					originals[index].base64,
					'base64',
				),
			),
		);
		await server.commands.writeFile(
			`${evidence}/comparison.json`,
			JSON.stringify(
				{
					testName,
					browser: server.browser,
					platform: server.platform,
					runtime: server.version,
					userAgent: navigator.userAgent,
					devicePixelRatio: window.devicePixelRatio,
					width,
					height,
					mismatchedPixels,
					maxChannelDelta,
					referenceSha256: originals[0].sha256,
					actualSha256: originals[1].sha256,
				},
				null,
				2,
			),
		);
	}

	return {mismatchedPixels, maxChannelDelta, diff: diffBlob, evidence};
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
