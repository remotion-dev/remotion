import {execFileSync} from 'node:child_process';
import {readFileSync} from 'node:fs';
import {createRequire} from 'node:module';
const dir = import.meta.dir,
	repo = process.env.REPO_ROOT!,
	req = createRequire(dir + '/package.json');
for (const mode of (
	process.env.MODES || 'baseline,persistent,persistent-overlap,worker'
).split(',')) {
	const result = await Bun.build({
		entrypoints: [dir + '/browser.tsx'],
		target: 'browser',
		format: 'esm',
		naming: mode + '.js',
		outdir: dir,
		define: {
			'process.env.NODE_ENV': '"production"',
			UPSTREAM_WORKER: mode === 'worker' ? 'true' : 'false',
		},
		plugins: [
			{
				name: 'benchmark-variants',
				setup(b) {
					b.onResolve(
						{
							filter:
								/^(remotion(?:\/.*)?|@remotion\/media|@remotion\/licensing|@remotion\/web-renderer|@mediabunny\/(?:mp3-encoder|aac-encoder|flac-encoder)|react(?:\/.*)?|react-dom(?:\/.*)?|mediabunny)$/,
						},
						(a) => {
							if (a.path === 'remotion')
								return {path: repo + '/packages/core/src/index.ts'};
							if (a.path === 'remotion/no-react')
								return {path: repo + '/packages/core/src/no-react.ts'};
							if (a.path === 'remotion/version')
								return {path: repo + '/packages/core/src/version.ts'};
							if (a.path === '@remotion/media')
								return {path: repo + '/packages/media/src/index.ts'};
							if (a.path === '@remotion/licensing')
								return {path: repo + '/packages/licensing/src/index.ts'};
							if (a.path === '@remotion/web-renderer')
								return {path: repo + '/packages/web-renderer/src/index.ts'};
							if (a.path === 'mediabunny')
								return {
									path: req
										.resolve(a.path)
										.replace(
											'/dist/bundles/mediabunny.node.cjs',
											'/dist/modules/src/index.js',
										),
								};
							return {path: req.resolve(a.path)};
						},
					);
					b.onLoad(
						{
							filter:
								/\/packages\/web-renderer\/src\/(html-in-canvas\.ts|html-in-canvas-worker\.ts|take-screenshot\.ts|render-media-on-web\.tsx)$/,
						},
						(a) => {
							if (
								mode === 'main-snapshot' &&
								a.path.endsWith('html-in-canvas-worker.ts')
							)
								return {
									contents: `
import {waitForPaint} from './html-in-canvas';
export const createHtmlInCanvasWorker=({layoutCanvas,signal})=>{const canvas=layoutCanvas.transferControlToOffscreen();const ctx=canvas.getContext('2d');return {async capture({element,width,height,timestamp}){if(canvas.width!==width)canvas.width=width;if(canvas.height!==height)canvas.height=height;await waitForPaint(layoutCanvas,signal);const image=layoutCanvas.captureElementImage(element);try{ctx.reset();ctx.drawElementImage(image,0,0,width,height);return {frame:Promise.resolve(new VideoFrame(canvas,{timestamp}))}}finally{image.close()}},[Symbol.dispose](){canvas.width=0;canvas.height=0}}};`,
									loader: 'ts',
								};
							let s =
								mode === 'baseline' || mode === 'persistent'
									? execFileSync(
											'git',
											[
												'show',
												'c320056a980972de109ef27a40bede9660a46931:' +
													a.path.slice(repo.length + 1),
											],
											{cwd: repo, encoding: 'utf8'},
										)
									: readFileSync(a.path, 'utf8');
							if (
								mode.startsWith('persistent') &&
								a.path.endsWith('html-in-canvas.ts')
							)
								s = s.replace(
									/\tconst offscreen = new OffscreenCanvas\(scaledWidth, scaledHeight\);[\s\S]*?\treturn offCtx;/,
									'\treturn ctx;',
								);
							if (
								mode === 'persistent-overlap' &&
								a.path.endsWith('render-media-on-web.tsx')
							)
								s = s
									.replace(
										'using htmlInCanvasWorker =',
										'using htmlInCanvasWorker =\n false &&',
									)
									.replace(
										'if (!htmlInCanvasWorker) await pendingEncoding;',
										'// Benchmark: overlap submission without moving capture to a worker.',
									);
							return {
								contents: s,
								loader: a.path.endsWith('tsx') ? 'tsx' : 'ts',
							};
						},
					);
				},
			},
		],
	});
	if (!result.success) throw Error(result.logs.join('\n'));
}
