import { waitUntil } from "@vercel/functions";
import { RenderRequest } from "../../../../types/schema";
import {
	createDisposableWriter,
	formatSSE,
	type RenderProgress,
} from "./helpers";
import { getOrCreateSandbox } from "./get-or-create-sandbox";
import { runRenderInSandbox } from "./run-render-in-sandbox";

export async function POST(req: Request) {
	const encoder = new TextEncoder();
	const stream = new TransformStream();
	const writer = stream.writable.getWriter();

	const send = async (message: RenderProgress) => {
		await writer.write(encoder.encode(formatSSE(message)));
	};

	const runRender = async () => {
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		await using _writer = createDisposableWriter(writer);

		try {
			const payload = await req.json();
			const body = RenderRequest.parse(payload);

			await using sandbox = await getOrCreateSandbox(send);
			await runRenderInSandbox({
				sandbox,
				inputProps: body.inputProps,
				onProgress: send,
			});
		} catch (err) {
			console.log(err);
			await send({ type: "error", message: (err as Error).message });
		}
	};

	waitUntil(runRender());

	return new Response(stream.readable, {
		headers: {
			"Content-Type": "text/event-stream",
			"Cache-Control": "no-cache",
			Connection: "keep-alive",
		},
	});
}
