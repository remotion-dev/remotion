import {createRequire} from 'node:module';
import {bundle} from '@remotion/bundler';
import {selectComposition} from '@remotion/renderer';

const require = createRequire(import.meta.url);

const compositionId = 'Issue8198';
const timeoutMs = Number(process.env.SELECT_COMPOSITION_TIMEOUT_MS ?? 120000);

if (!Number.isFinite(timeoutMs) || timeoutMs <= 0) {
	throw new Error('SELECT_COMPOSITION_TIMEOUT_MS must be a positive number');
}

const withTimeout = async (promise, label) => {
	let timeout;
	const timeoutPromise = new Promise((_, reject) => {
		timeout = setTimeout(() => {
			reject(new Error(`${label} did not resolve within ${timeoutMs}ms`));
		}, timeoutMs);
	});

	try {
		return await Promise.race([promise, timeoutPromise]);
	} finally {
		clearTimeout(timeout);
	}
};

console.info(`[issue-8198] Node ${process.version}`);
console.info('[issue-8198] Bundling minimal Remotion project');

const serveUrl = await bundle({
	entryPoint: require.resolve('./src/Root.jsx'),
	logLevel: 'verbose',
});

console.info(`[issue-8198] Bundle ready at ${serveUrl}`);
console.info(`[issue-8198] Calling selectComposition(${compositionId})`);

const startedAt = Date.now();
const composition = await withTimeout(
	selectComposition({
		id: compositionId,
		inputProps: {},
		logLevel: 'verbose',
		serveUrl,
	}),
	'selectComposition()',
);

console.info(
	`[issue-8198] selectComposition() resolved in ${Date.now() - startedAt}ms`,
);
console.info('[issue-8198] Composition:', {
	durationInFrames: composition.durationInFrames,
	fps: composition.fps,
	height: composition.height,
	id: composition.id,
	width: composition.width,
});
