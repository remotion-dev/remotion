import {
	LambdaClientInternals,
	type StreamingPayload,
} from '@remotion/lambda-client';
import type {ResponseStreamWriter} from './stream-writer';

// One in-flight write and one replaceable update. Rendering never awaits a reader.
export const makeProgressStream = (writer: ResponseStreamWriter) => {
	let pending: StreamingPayload | null = null;
	let writing: Promise<void> | null = null;
	let disconnected = false;
	let terminal = false;

	const bounded = async (operation: () => Promise<void>) => {
		let timer: ReturnType<typeof setTimeout> | null = null;
		try {
			await Promise.race([
				operation(),
				new Promise<void>((_resolve, reject) => {
					timer = setTimeout(
						() => reject(new Error('Progress stream stalled')),
						1000,
					);
				}),
			]);
		} catch {
			disconnected = true;
			pending = null;
		} finally {
			if (timer) {
				clearTimeout(timer);
			}
		}
	};

	const publish = (message: StreamingPayload) => {
		if (disconnected || terminal) {
			return;
		}

		terminal =
			message.type === 'render-complete' || message.type === 'render-failed';
		pending = message;
		if (writing) {
			return;
		}

		writing = (async () => {
			while (pending) {
				const next = pending;
				pending = null;
				await bounded(() =>
					writer.write(
						LambdaClientInternals.makeStreamPayload({message: next}),
					),
				);
			}

			writing = null;
		})();
	};

	return {
		publish,
		async end() {
			if (writing) {
				await writing;
			}

			await bounded(() => writer.end());
		},
	};
};
