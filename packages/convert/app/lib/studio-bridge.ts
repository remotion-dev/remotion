export type StudioBridgeSession = {
	origin: string;
	sourceAsset: string | null;
	token: string;
};

const saveToStudioMessageType = 'remotion-convert-output';
const saveToStudioResultMessageType = 'remotion-convert-output-result';

type SaveToStudioResultMessage = {
	type: typeof saveToStudioResultMessageType;
	token: string;
	error: string | null;
	filename: string;
};

export const getStudioBridgeSession = (
	searchParams: URLSearchParams,
): StudioBridgeSession | null => {
	const origin = searchParams.get('studioOrigin');
	const token = searchParams.get('studioToken');
	if (!origin || !token) {
		return null;
	}

	try {
		const parsed = new URL(origin);
		if (parsed.origin !== origin) {
			return null;
		}
	} catch {
		return null;
	}

	return {
		origin,
		sourceAsset: searchParams.get('sourceAsset'),
		token,
	};
};

const isSaveToStudioResultMessage = (
	data: unknown,
): data is SaveToStudioResultMessage => {
	if (typeof data !== 'object' || data === null) {
		return false;
	}

	const candidate = data as SaveToStudioResultMessage;
	return (
		candidate.type === saveToStudioResultMessageType &&
		typeof candidate.token === 'string' &&
		typeof candidate.filename === 'string' &&
		(candidate.error === null || typeof candidate.error === 'string')
	);
};

export const saveFileToStudio = ({
	file,
	filename,
	session,
}: {
	file: File;
	filename: string;
	session: StudioBridgeSession;
}) => {
	if (!window.opener) {
		return Promise.reject(
			new Error('The Studio window is no longer connected'),
		);
	}

	return new Promise<string>((resolve, reject) => {
		const controller = new AbortController();
		const timeout = window.setTimeout(() => {
			controller.abort();
			reject(new Error('Timed out waiting for Studio'));
		}, 30000);
		const cleanup = () => {
			window.clearTimeout(timeout);
			controller.abort();
		};

		function onMessage(event: MessageEvent) {
			if (event.origin !== session.origin) {
				return;
			}

			if (!isSaveToStudioResultMessage(event.data)) {
				return;
			}

			if (event.data.token !== session.token) {
				return;
			}

			cleanup();

			if (event.data.error) {
				reject(new Error(event.data.error));
				return;
			}

			resolve(event.data.filename);
		}

		window.addEventListener('message', onMessage, {signal: controller.signal});
		window.opener.postMessage(
			{
				type: saveToStudioMessageType,
				token: session.token,
				filename,
				file,
			},
			session.origin,
		);
	});
};
