import { renderMedia, selectComposition } from "@remotion/renderer";

const config = JSON.parse(process.argv[2]);

async function main() {
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
		console.error(JSON.stringify({ type: "error", message: err.message }));
		process.exit(1);
	}
}

main();
