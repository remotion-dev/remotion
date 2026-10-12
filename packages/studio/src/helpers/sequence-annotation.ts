import type {ResolvedStackLocation, TSequence} from 'remotion';
import {getRelativeFileLocation} from './format-file-location';

export const getSequenceAnnotationMetadata = ({
	sequence,
	location,
}: {
	readonly sequence: TSequence;
	readonly location: ResolvedStackLocation | null;
}): Record<string, string | number> => {
	const metadata: Record<string, string | number> = {
		layer: (
			sequence.displayName ||
			sequence.controls?.componentName ||
			'Layer'
		).slice(0, 128),
		...(Number.isFinite(sequence.from) ? {from: sequence.from} : {}),
		...(Number.isFinite(sequence.duration)
			? {duration: sequence.duration}
			: {}),
	};
	const relativeLocation = getRelativeFileLocation({
		location,
		root: window.remotion_cwd,
	});
	if (relativeLocation && relativeLocation.filename.length <= 256) {
		const withSource = {
			...metadata,
			source: relativeLocation.filename,
			line: relativeLocation.line,
		};
		// The browser accepts at most six keys and 2,048 UTF-8 bytes. Omit
		// oversized source context instead of truncating the filename.
		if (new TextEncoder().encode(JSON.stringify(withSource)).length <= 2048) {
			return withSource;
		}
	}

	return metadata;
};
