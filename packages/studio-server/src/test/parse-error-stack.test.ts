import {getLocationFromBuildError} from '@remotion/studio-shared';
import {expect, test} from 'bun:test';

const message =
	'Module build failed (from ../../node_modules/.pnpm/esbuild-loader@2.15.1_webpack@5.60.0/node_modules/esbuild-loader/dist/index.js):\nError: Transform failed with 1 error:\n/Users/jonathanburger/remotion/packages/example/src/Video.tsx:31:83: error: Expected ">" but found "\\": 100}\'`\\n\\t\\t\\t\\tdurationInFrames={inputProps?.duration ?? 20}\\n\\t\\t\\t/>\\n\\t\\t\\t<Composition\\n\\t\\t\\t\\tid=\\""\n    at failureErrorWithLog (/Users/jonathanburger/remotion/node_modules/.pnpm/esbuild@0.12.29/node_modules/esbuild/lib/main.js:1475:15)\n    at /Users/jonathanburger/remotion/node_modules/.pnpm/esbuild@0.12.29/node_modules/esbuild/lib/main.js:1264:29\n    at /Users/jonathanburger/remotion/node_modules/.pnpm/esbuild@0.12.29/node_modules/esbuild/lib/main.js:611:9\n    at handleIncomingPacket (/Users/jonathanburger/remotion/node_modules/.pnpm/esbuild@0.12.29/node_modules/esbuild/lib/main.js:708:9)\n    at Socket.readFromStdout (/Users/jonathanburger/remotion/node_modules/.pnpm/esbuild@0.12.29/node_modules/esbuild/lib/main.js:578:7)\n    at Socket.emit (node:events:390:28)\n    at addChunk (node:internal/streams/readable:315:12)\n    at readableAddChunk (node:internal/streams/readable:289:9)\n    at Socket.Readable.push (node:internal/streams/readable:228:10)\n    at Pipe.onStreamRead (node:internal/stream_base_commons:199:23)';
const stack =
	'Error: Module build failed (from ../../node_modules/.pnpm/esbuild-loader@2.15.1_webpack@5.60.0/node_modules/esbuild-loader/dist/index.js):\nError: Transform failed with 1 error:\n/Users/jonathanburger/remotion/packages/example/src/Video.tsx:31:83: error: Expected ">" but found "\\": 100}\'`\\n\\t\\t\\t\\tdurationInFrames={inputProps?.duration ?? 20}\\n\\t\\t\\t/>\\n\\t\\t\\t<Composition\\n\\t\\t\\t\\tid=\\""\n    at failureErrorWithLog (/Users/jonathanburger/remotion/node_modules/.pnpm/esbuild@0.12.29/node_modules/esbuild/lib/main.js:1475:15)\n    at /Users/jonathanburger/remotion/node_modules/.pnpm/esbuild@0.12.29/node_modules/esbuild/lib/main.js:1264:29\n    at /Users/jonathanburger/remotion/node_modules/.pnpm/esbuild@0.12.29/node_modules/esbuild/lib/main.js:611:9\n    at handleIncomingPacket (/Users/jonathanburger/remotion/node_modules/.pnpm/esbuild@0.12.29/node_modules/esbuild/lib/main.js:708:9)\n    at Socket.readFromStdout (/Users/jonathanburger/remotion/node_modules/.pnpm/esbuild@0.12.29/node_modules/esbuild/lib/main.js:578:7)\n    at Socket.emit (node:events:390:28)\n    at addChunk (node:internal/streams/readable:315:12)\n    at readableAddChunk (node:internal/streams/readable:289:9)\n    at Socket.Readable.push (node:internal/streams/readable:228:10)\n    at Pipe.onStreamRead (node:internal/stream_base_commons:199:23)';

test('Parse error stack', () => {
	expect(
		getLocationFromBuildError({
			stack,
			message,
			name: 'Error',
		}),
	).toEqual({
		fileName: '/Users/jonathanburger/remotion/packages/example/src/Video.tsx',
		lineNumber: 31,
		columnNumber: 83,
		message:
			'error: Expected ">" but found "\\": 100}\'`\\n\\t\\t\\t\\tdurationInFrames={inputProps?.duration ?? 20}\\n\\t\\t\\t/>\\n\\t\\t\\t<Composition\\n\\t\\t\\t\\tid=\\""',
	});
});
