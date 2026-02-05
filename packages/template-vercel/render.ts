// This file is copied into the Vercel sandbox and executed with `node --strip-types`
import { renderMedia, selectComposition } from "@remotion/renderer";

export type RenderConfig = {
	serveUrl: string;
	compositionId: string;
	inputProps: Record<string, unknown>;
};

const config: RenderConfig = JSON.parse(process.argv[2]);

try {
	const composition = await selectComposition({
		serveUrl: config.serveUrl,
		id: config.compositionId,
		inputProps: config.inputProps,
	});

	await renderMedia({
		composition,
		serveUrl: config.serveUrl,
		codec: "h264",
		outputLocation: "/tmp/video.mp4",
		inputProps: config.inputProps,
		onProgress: ({ progress }) => {
			console.log(JSON.stringify({ type: "progress", progress }));
		},
	});

	console.log(JSON.stringify({ type: "done" }));
} catch (err) {
	// This prints to stderr, not stdout
	console.error((err as Error).message);
	process.exit(1);
}
