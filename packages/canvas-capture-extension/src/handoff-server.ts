import {
	canvasCapturePortName,
	type CanvasCaptureResponse,
} from '@remotion/studio-shared/canvas-capture-handoff';
import {browser, type Browser} from 'wxt/browser';
import {
	getChunkKey,
	getMetadataKey,
	getStoredCapture,
	removeExpiredCaptures,
	removeStoredCapture,
	type StoredCaptureMetadata,
} from './handoff';

const handoffOrigin = import.meta.env.CANVAS_CAPTURE_HANDOFF_ORIGIN as string;

export const startCaptureHandoff = () => {
	const transfers = new Map<string, Browser.runtime.Port>();
	const completing = new Set<string>();
	removeExpiredCaptures().catch(() => undefined);

	browser.runtime.onMessage.addListener((message, sender) => {
		if (
			sender.id !== browser.runtime.id ||
			typeof message !== 'object' ||
			message === null ||
			message.type !== 'remotion-canvas-capture-open' ||
			typeof message.captureId !== 'string'
		) {
			return;
		}

		return (async () => {
			await removeExpiredCaptures();
			const metadata = await getStoredCapture(message.captureId);
			if (
				!metadata ||
				metadata.expiresAt <= Date.now() ||
				metadata.tabId !== null
			) {
				throw new Error(
					'The canvas capture has expired or was already opened.',
				);
			}

			// Bind the token before the destination can establish a connection.
			const tab = await browser.tabs.create({
				url: 'about:blank',
				active: false,
			});
			if (tab.id === undefined) {
				throw new Error('Could not open the canvas capture.');
			}

			try {
				await browser.storage.local.set({
					[getMetadataKey(message.captureId)]: {...metadata, tabId: tab.id},
				});
				const url = new URL(`/${metadata.destination}`, handoffOrigin);
				url.hash = new URLSearchParams({
					'canvas-capture': message.captureId,
					'canvas-capture-extension': browser.runtime.id,
				}).toString();
				await browser.tabs.update(tab.id, {url: url.toString(), active: true});
			} catch (error) {
				await browser.tabs.remove(tab.id).catch(() => undefined);
				throw error;
			}
		})();
	});

	browser.runtime.onConnectExternal.addListener((port) => {
		const {sender} = port;
		if (
			port.name !== canvasCapturePortName ||
			!sender?.url ||
			sender.tab?.id === undefined ||
			sender.frameId !== 0
		) {
			port.disconnect();
			return;
		}

		let senderUrl: URL;
		try {
			senderUrl = new URL(sender.url);
		} catch {
			port.disconnect();
			return;
		}

		if (
			![
				handoffOrigin,
				'https://remotion.dev',
				'https://www.remotion.dev',
			].includes(senderUrl.origin)
		) {
			port.disconnect();
			return;
		}

		let captureId: string | null = null;
		let metadata: StoredCaptureMetadata | null = null;
		let nextChunk = 0;
		let busy = false;
		let disconnected = false;
		const send = (message: CanvasCaptureResponse) => {
			if (!disconnected) {
				port.postMessage(message);
			}
		};

		port.onDisconnect.addListener(() => {
			disconnected = true;
			if (captureId && transfers.get(captureId) === port) {
				transfers.delete(captureId);
			}
		});

		port.onMessage.addListener((message: unknown) => {
			const receive = async () => {
				if (
					busy ||
					disconnected ||
					typeof message !== 'object' ||
					message === null ||
					!('type' in message) ||
					!('captureId' in message) ||
					typeof message.captureId !== 'string'
				) {
					throw new Error('Invalid canvas capture request.');
				}

				busy = true;
				if (captureId === null) {
					if (
						message.type !== 'start' ||
						!/^[0-9a-f-]{36}$/.test(message.captureId) ||
						completing.has(message.captureId)
					) {
						throw new Error('Invalid canvas capture token.');
					}

					const stored = await getStoredCapture(message.captureId);
					if (!stored || stored.expiresAt <= Date.now()) {
						if (stored) {
							await removeStoredCapture(message.captureId, stored.chunks);
						}

						throw new Error(
							'The canvas capture has expired. Open the recording from the extension again.',
						);
					}

					const parameters = new URLSearchParams(senderUrl.hash.slice(1));
					if (
						stored.tabId !== sender.tab?.id ||
						(senderUrl.pathname !== `/${stored.destination}` &&
							senderUrl.pathname !== `/${stored.destination}/`) ||
						parameters.get('canvas-capture') !== message.captureId ||
						parameters.get('canvas-capture-extension') !== browser.runtime.id
					) {
						throw new Error('This page cannot receive that canvas capture.');
					}

					if (disconnected || completing.has(message.captureId)) {
						return;
					}

					captureId = message.captureId;
					metadata = stored;
					// React may reconnect the same destination while an effect is remounted.
					transfers.get(captureId)?.disconnect();
					transfers.set(captureId, port);
					send({
						type: 'start',
						captureId,
						filename: stored.filename,
						mimeType: stored.mimeType,
						size: stored.size,
						chunks: stored.chunks,
					});
					return;
				}

				if (
					!metadata ||
					message.captureId !== captureId ||
					transfers.get(captureId) !== port ||
					metadata.expiresAt <= Date.now()
				) {
					throw new Error(
						'The canvas capture transfer is no longer available.',
					);
				}

				if (
					message.type === 'chunk' &&
					'index' in message &&
					message.index === nextChunk &&
					nextChunk < metadata.chunks
				) {
					const key = getChunkKey(captureId, nextChunk);
					const stored = await browser.storage.local.get(key);
					const data = stored[key];
					if (typeof data !== 'string') {
						throw new Error('The canvas capture is missing a recording chunk.');
					}

					send({type: 'chunk', captureId, index: nextChunk, data});
					nextChunk++;
					return;
				}

				if (message.type === 'complete' && nextChunk === metadata.chunks) {
					completing.add(captureId);
					await browser.storage.local.set({
						[getMetadataKey(captureId)]: {...metadata, expiresAt: 0},
					});
					await removeStoredCapture(captureId, metadata.chunks);
					send({type: 'complete', captureId});
					transfers.delete(captureId);
					completing.delete(captureId);
					return;
				}

				throw new Error('Unexpected canvas capture request.');
			};

			receive()
				.catch((error) => {
					send({
						type: 'error',
						message: error instanceof Error ? error.message : String(error),
					});
					port.disconnect();
				})
				.finally(() => {
					busy = false;
				});
		});
	});
};
