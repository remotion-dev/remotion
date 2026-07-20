const figmaMetaStart = '<!--(figmeta)';
const figmaMetaEnd = '(/figmeta)-->';
const figmaDataStart = '<!--(figma)';
const figmaDataEnd = '(/figma)-->';

const hasSection = ({
	end,
	html,
	start,
}: {
	end: string;
	html: string;
	start: string;
}) => {
	const startIndex = html.indexOf(start);
	return (
		startIndex !== -1 && html.indexOf(end, startIndex + start.length) !== -1
	);
};

export const getClipboardFigmaHtml = (
	clipboardData: DataTransfer,
): string | null => {
	const html = clipboardData.getData('text/html');
	if (
		!hasSection({end: figmaMetaEnd, html, start: figmaMetaStart}) ||
		!hasSection({end: figmaDataEnd, html, start: figmaDataStart})
	) {
		return null;
	}

	return html;
};

export const hasClipboardFigmaPayload = (clipboardData: DataTransfer) => {
	return getClipboardFigmaHtml(clipboardData) !== null;
};

export const formatFigmaClipboardError = (reason: string) => {
	const withoutPrefix = reason
		.replace(/^(?:Cannot|Could not) import Figma selection:\s*/i, '')
		.trim();
	const message =
		withoutPrefix.toLowerCase() === 'clipboard scene is incomplete'
			? 'Pasting images from Figma is not supported'
			: withoutPrefix;

	if (/[.!?]$/.test(message)) {
		return message;
	}

	return `${message}.`;
};

export const formatFigmaClipboardErrorNotification = (reason: string) => {
	return `${formatFigmaClipboardError(reason)} Try “Copy as SVG” in Figma and paste again.`;
};
