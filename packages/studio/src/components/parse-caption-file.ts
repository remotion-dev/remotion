import type {Caption} from '@remotion/captions';

const isObject = (value: unknown): value is Record<string, unknown> => {
	return typeof value === 'object' && value !== null && !Array.isArray(value);
};

const isFiniteNumber = (value: unknown): value is number => {
	return typeof value === 'number' && Number.isFinite(value);
};

export const parseCaptionFile = ({
	fileName,
	contents,
}: {
	fileName: string;
	contents: string;
}): Caption[] => {
	if (!fileName.toLowerCase().endsWith('.json')) {
		throw new Error('Unsupported caption file. Choose a .json file.');
	}

	let parsed: unknown;
	try {
		parsed = JSON.parse(contents);
	} catch (error) {
		throw new Error(
			`Invalid JSON: ${error instanceof Error ? error.message : String(error)}`,
		);
	}

	if (!Array.isArray(parsed)) {
		throw new Error('Expected a Remotion Caption[] JSON array.');
	}

	let previousStart: number | null = null;
	for (const [index, caption] of parsed.entries()) {
		const path = `captions[${index}]`;
		if (!isObject(caption)) {
			throw new Error(`${path} must be an object.`);
		}

		if (typeof caption.text !== 'string') {
			throw new Error(`${path}.text must be a string.`);
		}

		if (!isFiniteNumber(caption.startMs) || caption.startMs < 0) {
			throw new Error(`${path}.startMs must be a finite, non-negative number.`);
		}

		if (!isFiniteNumber(caption.endMs) || caption.endMs < 0) {
			throw new Error(`${path}.endMs must be a finite, non-negative number.`);
		}

		if (caption.endMs < caption.startMs) {
			throw new Error(`${path}.endMs must not be earlier than startMs.`);
		}

		if (caption.timestampMs !== null && !isFiniteNumber(caption.timestampMs)) {
			throw new Error(`${path}.timestampMs must be a finite number or null.`);
		}

		if (caption.confidence !== null && !isFiniteNumber(caption.confidence)) {
			throw new Error(`${path}.confidence must be a finite number or null.`);
		}

		if (
			typeof caption.confidence === 'number' &&
			(caption.confidence < 0 || caption.confidence > 1)
		) {
			throw new Error(`${path}.confidence must be between 0 and 1.`);
		}

		if (
			caption.pageBreakAfter !== undefined &&
			typeof caption.pageBreakAfter !== 'boolean'
		) {
			throw new Error(
				`${path}.pageBreakAfter must be a boolean when provided.`,
			);
		}

		if (previousStart !== null && caption.startMs < previousStart) {
			throw new Error(`${path}.startMs is out of timestamp order.`);
		}

		previousStart = caption.startMs;
	}

	return parsed as Caption[];
};
