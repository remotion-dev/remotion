import {staticFile} from 'remotion';
import {writeStaticFile} from '../api/write-static-file';
import {showNotification} from '../components/Notifications/NotificationCenter';

const convertDevUrl = 'http://localhost:5173/convert';
const saveToStudioMessageType = 'remotion-convert-output';
const saveToStudioResultMessageType = 'remotion-convert-output-result';

type SaveToStudioMessage = {
	type: typeof saveToStudioMessageType;
	token: string;
	filename: string;
	file: File;
};

const getRandomToken = () => {
	if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
		return crypto.randomUUID();
	}

	return String(Math.random()).replace('0.', '');
};

const getOutputPath = ({
	filename,
	sourceRelativePath,
}: {
	filename: string;
	sourceRelativePath: string;
}) => {
	const basename = filename.split(/[\\/]/).pop()?.trim();
	if (!basename || basename === '.' || basename === '..') {
		throw new Error(
			'Received an invalid output filename from Remotion Convert',
		);
	}

	const parentDir = sourceRelativePath.split('/').slice(0, -1).join('/');
	return parentDir ? `${parentDir}/${basename}` : basename;
};

const isSaveToStudioMessage = (data: unknown): data is SaveToStudioMessage => {
	if (typeof data !== 'object' || data === null) {
		return false;
	}

	const candidate = data as SaveToStudioMessage;
	return (
		candidate.type === saveToStudioMessageType &&
		typeof candidate.token === 'string' &&
		typeof candidate.filename === 'string' &&
		candidate.file instanceof File
	);
};

export const openInRemotionConvert = ({
	relativePath,
}: {
	relativePath: string;
}) => {
	const token = getRandomToken();
	const convertUrl = new URL(convertDevUrl);
	const convertOrigin = convertUrl.origin;
	const assetUrl = new URL(staticFile(relativePath), window.location.origin);

	convertUrl.searchParams.set('url', assetUrl.toString());
	convertUrl.searchParams.set('studioOrigin', window.location.origin);
	convertUrl.searchParams.set('studioToken', token);
	convertUrl.searchParams.set('sourceAsset', relativePath);

	const convertWindow = window.open(convertUrl.toString(), '_blank');
	if (!convertWindow) {
		showNotification('Could not open Remotion Convert', 2000);
		return;
	}

	function closeListener() {
		window.removeEventListener('message', onMessage);
		window.clearInterval(closePoll);
	}

	const postResult = ({
		error,
		filename,
	}: {
		error: string | null;
		filename: string;
	}) => {
		convertWindow.postMessage(
			{
				type: saveToStudioResultMessageType,
				token,
				error,
				filename,
			},
			convertOrigin,
		);
	};

	async function onMessage(event: MessageEvent) {
		if (event.origin !== convertOrigin) {
			return;
		}

		if (!isSaveToStudioMessage(event.data)) {
			return;
		}

		if (event.data.token !== token) {
			return;
		}

		const notification = showNotification('Saving converted file...', null);
		try {
			const filePath = getOutputPath({
				filename: event.data.filename,
				sourceRelativePath: relativePath,
			});
			await writeStaticFile({
				contents: await event.data.file.arrayBuffer(),
				filePath,
			});
			notification.replaceContent(`Saved ${filePath}`, 3000);
			postResult({error: null, filename: filePath});
			closeListener();
		} catch (err) {
			const {message} = err as Error;
			notification.replaceContent(`Could not save file: ${message}`, 3000);
			postResult({error: message, filename: event.data.filename});
		}
	}

	const closePoll = window.setInterval(() => {
		if (convertWindow.closed) {
			closeListener();
		}
	}, 1000);

	window.addEventListener('message', onMessage);
	showNotification('Opened Remotion Convert', 2000);
};
