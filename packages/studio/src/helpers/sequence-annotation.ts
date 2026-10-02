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
			sequence.id
		).slice(0, 128),
		sequenceId: sequence.id.slice(0, 128),
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

export const getSequenceAnnotationAttributes = ({
	sequence,
	location,
	surface,
}: {
	readonly sequence: TSequence;
	readonly location: ResolvedStackLocation | null;
	readonly surface: 'outline' | 'layer' | 'track';
}) => {
	const metadata = getSequenceAnnotationMetadata({sequence, location});
	return {
		'data-remotion-annotation-surface': surface,
		'data-remotion-layer': metadata.layer,
		'data-remotion-sequence-id': metadata.sequenceId,
		'data-remotion-sequence-type': sequence.type,
		'data-remotion-from': metadata.from,
		'data-remotion-duration': metadata.duration,
		'data-remotion-source': metadata.source,
		'data-remotion-line': metadata.line,
		'oai-annotatable': metadata.layer,
		'oai-annotation-metadata': JSON.stringify(metadata),
	};
};
