import {isRecord} from './validation';

export type RenderOutputDragData = {
	type: 'remotion-render-output';
	version: 1;
	outputPath: string;
	fileName: string;
};

export const makeRenderOutputDragData = ({
	outputPath,
	fileName,
}: {
	outputPath: string;
	fileName: string;
}): RenderOutputDragData => {
	return {
		type: 'remotion-render-output',
		version: 1,
		outputPath,
		fileName,
	};
};

export const parseRenderOutputDragData = (
	value: string,
): RenderOutputDragData | null => {
	try {
		const parsed: unknown = JSON.parse(value);
		if (
			!isRecord(parsed) ||
			parsed.type !== 'remotion-render-output' ||
			parsed.version !== 1 ||
			typeof parsed.outputPath !== 'string' ||
			parsed.outputPath.length === 0 ||
			typeof parsed.fileName !== 'string' ||
			parsed.fileName.length === 0 ||
			parsed.fileName.includes('/') ||
			parsed.fileName.includes('\\')
		) {
			return null;
		}

		return makeRenderOutputDragData({
			outputPath: parsed.outputPath,
			fileName: parsed.fileName,
		});
	} catch {
		return null;
	}
};
